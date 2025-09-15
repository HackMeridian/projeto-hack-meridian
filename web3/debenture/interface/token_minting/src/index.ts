import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CAWNQMR3DSXUGVOHXNOUJRAE6SNFSFHE47LT6J5USCOF5P3QUFAI2Y5D",
  }
} as const


export interface Bond {
  bond_status: BondStatus;
  currency: string;
  denomination: i128;
  frequency: u64;
  interest_rate: i128;
  issue_date: u64;
  issue_number: u64;
  maturity_date: u64;
}


export interface IssueData {
  investor: string;
  principal: u64;
}

export type BondStatus = {tag: "Offered", values: void} | {tag: "Issued", values: void} | {tag: "Matured", values: void} | {tag: "Redeemed", values: void};


export interface TokenMinting {
  custody_contract: string;
  max_total_supply: u64;
}

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({custody_contract}: {custody_contract: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a mint_tokens transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  mint_tokens: ({payer, number_of_debentures}: {payer: string, number_of_debentures: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a transfer_bond_ownership transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  transfer_bond_ownership: ({bond_id, new_investor}: {bond_id: u64, new_investor: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_bond_details transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_bond_details: ({bond_id}: {bond_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Bond>>

  /**
   * Construct and simulate a get_investor_bonds transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_investor_bonds: ({investor}: {investor: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<u64>>>

  /**
   * Construct and simulate a get_investor_by_bond_id transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_investor_by_bond_id: ({bond_id}: {bond_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a issue_volume transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  issue_volume: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a set_bond_template transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_bond_template: ({bond_template}: {bond_template: Bond}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAABEJvbmQAAAAIAAAAAAAAAAtib25kX3N0YXR1cwAAAAfQAAAACkJvbmRTdGF0dXMAAAAAAAAAAAAIY3VycmVuY3kAAAATAAAAAAAAAAxkZW5vbWluYXRpb24AAAALAAAAAAAAAAlmcmVxdWVuY3kAAAAAAAAGAAAAAAAAAA1pbnRlcmVzdF9yYXRlAAAAAAAACwAAAAAAAAAKaXNzdWVfZGF0ZQAAAAAABgAAAAAAAAAMaXNzdWVfbnVtYmVyAAAABgAAAAAAAAANbWF0dXJpdHlfZGF0ZQAAAAAAAAY=",
        "AAAAAQAAAAAAAAAAAAAACUlzc3VlRGF0YQAAAAAAAAIAAAAAAAAACGludmVzdG9yAAAAEwAAAAAAAAAJcHJpbmNpcGFsAAAAAAAABg==",
        "AAAAAgAAAAAAAAAAAAAACkJvbmRTdGF0dXMAAAAAAAQAAAAAAAAAAAAAAAdPZmZlcmVkAAAAAAAAAAAAAAAABklzc3VlZAAAAAAAAAAAAAAAAAAHTWF0dXJlZAAAAAAAAAAAAAAAAAhSZWRlZW1lZA==",
        "AAAAAQAAAAAAAAAAAAAADFRva2VuTWludGluZwAAAAIAAAAAAAAAEGN1c3RvZHlfY29udHJhY3QAAAATAAAAAAAAABBtYXhfdG90YWxfc3VwcGx5AAAABg==",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAQAAAAAAAAAQY3VzdG9keV9jb250cmFjdAAAABMAAAAA",
        "AAAAAAAAAAAAAAALbWludF90b2tlbnMAAAAAAgAAAAAAAAAFcGF5ZXIAAAAAAAATAAAAAAAAABRudW1iZXJfb2ZfZGViZW50dXJlcwAAAAYAAAAA",
        "AAAAAAAAAAAAAAAXdHJhbnNmZXJfYm9uZF9vd25lcnNoaXAAAAAAAgAAAAAAAAAHYm9uZF9pZAAAAAAGAAAAAAAAAAxuZXdfaW52ZXN0b3IAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAQZ2V0X2JvbmRfZGV0YWlscwAAAAEAAAAAAAAAB2JvbmRfaWQAAAAABgAAAAEAAAfQAAAABEJvbmQ=",
        "AAAAAAAAAAAAAAASZ2V0X2ludmVzdG9yX2JvbmRzAAAAAAABAAAAAAAAAAhpbnZlc3RvcgAAABMAAAABAAAD6gAAAAY=",
        "AAAAAAAAAAAAAAAXZ2V0X2ludmVzdG9yX2J5X2JvbmRfaWQAAAAAAQAAAAAAAAAHYm9uZF9pZAAAAAAGAAAAAQAAABM=",
        "AAAAAAAAAAAAAAAMaXNzdWVfdm9sdW1lAAAAAAAAAAEAAAAG",
        "AAAAAAAAAAAAAAARc2V0X2JvbmRfdGVtcGxhdGUAAAAAAAABAAAAAAAAAA1ib25kX3RlbXBsYXRlAAAAAAAH0AAAAARCb25kAAAAAA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
        mint_tokens: this.txFromJSON<null>,
        transfer_bond_ownership: this.txFromJSON<null>,
        get_bond_details: this.txFromJSON<Bond>,
        get_investor_bonds: this.txFromJSON<Array<u64>>,
        get_investor_by_bond_id: this.txFromJSON<string>,
        issue_volume: this.txFromJSON<u64>,
        set_bond_template: this.txFromJSON<null>
  }
}