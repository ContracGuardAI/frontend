"use client";
import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useContractProgram, unitsToUsdc } from "./useContractProgram";

export type ContractStatus = "Active" | "Draft" | "Completed" | "Cancelled" | "Disputed";

export interface OnChainContract {
  id: string;
  title: string;
  contractor: string;
  contractorWallet: string;
  totalAmount: string;
  status: ContractStatus;
  checkpoints: { total: number; completed: number; current: string };
  createdAt: string;
  fairnessScore: number;
  role: "client" | "contractor";
}

interface RawCheckpoint {
  checkpointNumber: number;
  status: Record<string, unknown>;
}

interface RawContractAccount {
  client: PublicKey;
  contractor: PublicKey;
  totalAmount: BN;
  totalCheckpoints: number;
  completedCheckpoints: number;
  status: Record<string, unknown>;
  createdAt: BN;
  checkpoints: RawCheckpoint[];
}

interface ProgramAccountNamespace {
  contractAccount: {
    all: (filters: unknown[]) => Promise<Array<{ publicKey: PublicKey; account: RawContractAccount }>>;
  };
}

function shortKey(pk: PublicKey): string {
  const s = pk.toBase58();
  return `${s.slice(0, 4)}...${s.slice(-4)}`;
}

function deriveStatus(acc: RawContractAccount): ContractStatus {
  const key = Object.keys(acc.status)[0];
  if (key === "active") {
    const hasDisputed = acc.checkpoints?.some(cp => "disputed" in cp.status);
    if (hasDisputed) return "Disputed";
    return "Active";
  }
  if (key === "completed") return "Completed";
  if (key === "cancelled") return "Cancelled";
  return "Draft";
}

function loadMeta(pdaStr: string): { title?: string; contractorName?: string; fairnessScore?: number } | null {
  try {
    const raw = localStorage.getItem(`cgmeta_${pdaStr}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useContracts() {
  const { program, wallet } = useContractProgram();
  const [contracts, setContracts] = useState<OnChainContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async () => {
    if (!program || !wallet.publicKey) {
      setContracts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const pk = wallet.publicKey;
      const accounts = program.account as unknown as ProgramAccountNamespace;

      const [asClient, asContractor] = await Promise.all([
        accounts.contractAccount.all([{ memcmp: { offset: 8, bytes: pk.toBase58() } }]),
        accounts.contractAccount.all([{ memcmp: { offset: 40, bytes: pk.toBase58() } }]),
      ]);

      const seen = new Set<string>();
      const all = [
        ...asClient.map(a => ({ ...a, role: "client" as const })),
        ...asContractor.map(a => ({ ...a, role: "contractor" as const })),
      ].filter(({ publicKey }) => {
        const k = publicKey.toBase58();
        return seen.has(k) ? false : (seen.add(k), true);
      });

      // Sort by createdAt descending (newest first)
      all.sort((a, b) => b.account.createdAt.toNumber() - a.account.createdAt.toNumber());

      const mapped: OnChainContract[] = all.map(({ publicKey, account, role }) => {
        const pdaStr = publicKey.toBase58();
        const meta = loadMeta(pdaStr);
        const status = deriveStatus(account);

        const activeCheckpoint = account.checkpoints?.find(cp => {
          const k = Object.keys(cp.status)[0];
          return k !== "approved" && k !== "expired";
        });
        const currentLabel = activeCheckpoint
          ? `Checkpoint ${activeCheckpoint.checkpointNumber + 1}`
          : status === "Completed" ? "All done" : "Not started";

        const totalUsdc = unitsToUsdc(account.totalAmount);
        const createdAt = new Date(account.createdAt.toNumber() * 1000).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        });

        return {
          id: pdaStr,
          title: meta?.title ?? `Contract ${pdaStr.slice(0, 8)}...`,
          contractor: meta?.contractorName ?? shortKey(account.contractor),
          contractorWallet: shortKey(account.contractor),
          totalAmount: `${totalUsdc.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDC`,
          status,
          checkpoints: {
            total: account.totalCheckpoints,
            completed: account.completedCheckpoints,
            current: currentLabel,
          },
          createdAt,
          fairnessScore: meta?.fairnessScore ?? 0,
          role,
        };
      });

      setContracts(mapped);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch contracts");
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  return { contracts, loading, error, refetch: fetchContracts };
}
