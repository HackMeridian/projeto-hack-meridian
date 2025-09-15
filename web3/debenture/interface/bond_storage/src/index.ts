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
    contractId: "CD6RSELJQKHK4C3LYJR7QUH2Y7573S3LBAROXD77CPKEMB6DVSFPEWBP",
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


export interface Issuer {
  cnpj: string;
  institution: string;
  lei: string;
}


export interface IssueData {
  investor: string;
  principal: u64;
}

export type BondStatus = {tag: "Offered", values: void} | {tag: "Issued", values: void} | {tag: "Matured", values: void} | {tag: "Redeemed", values: void};

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({manager}: {manager: string}, options?: {
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
   * Construct and simulate a set_bond transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_bond: ({bond}: {bond: Bond}, options?: {
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
   * Construct and simulate a set_issuer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_issuer: ({issuer}: {issuer: Issuer}, options?: {
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
   * Construct and simulate a institution transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  institution: (options?: {
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
   * Construct and simulate a cnpj transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  cnpj: (options?: {
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
   * Construct and simulate a lei transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  lei: (options?: {
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
   * Construct and simulate a bond_info transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  bond_info: (options?: {
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
   * Construct and simulate a currency transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  currency: (options?: {
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
   * Construct and simulate a denomination transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  denomination: (options?: {
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
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a frequency transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  frequency: (options?: {
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
   * Construct and simulate a interest_rate transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  interest_rate: (options?: {
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
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a issue_date transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  issue_date: (options?: {
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
   * Construct and simulate a maturity_date transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  maturity_date: (options?: {
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
   * Construct and simulate a issuer_info transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  issuer_info: (options?: {
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
  }) => Promise<AssembledTransaction<Issuer>>

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
        "AAAAAQAAAAAAAAAAAAAABklzc3VlcgAAAAAAAwAAAAAAAAAEY25wagAAABAAAAAAAAAAC2luc3RpdHV0aW9uAAAAABMAAAAAAAAAA2xlaQAAAAAQ",
        "AAAAAQAAAAAAAAAAAAAACUlzc3VlRGF0YQAAAAAAAAIAAAAAAAAACGludmVzdG9yAAAAEwAAAAAAAAAJcHJpbmNpcGFsAAAAAAAABg==",
        "AAAAAgAAAAAAAAAAAAAACkJvbmRTdGF0dXMAAAAAAAQAAAAAAAAAAAAAAAdPZmZlcmVkAAAAAAAAAAAAAAAABklzc3VlZAAAAAAAAAAAAAAAAAAHTWF0dXJlZAAAAAAAAAAAAAAAAAhSZWRlZW1lZA==",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAQAAAAAAAAAHbWFuYWdlcgAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAIc2V0X2JvbmQAAAABAAAAAAAAAARib25kAAAH0AAAAARCb25kAAAAAA==",
        "AAAAAAAAAAAAAAAKc2V0X2lzc3VlcgAAAAAAAQAAAAAAAAAGaXNzdWVyAAAAAAfQAAAABklzc3VlcgAAAAAAAA==",
        "AAAAAAAAAAAAAAALaW5zdGl0dXRpb24AAAAAAAAAAAEAAAAT",
        "AAAAAAAAAAAAAAAEY25wagAAAAAAAAABAAAAEA==",
        "AAAAAAAAAAAAAAADbGVpAAAAAAAAAAABAAAAEA==",
        "AAAAAAAAAAAAAAAJYm9uZF9pbmZvAAAAAAAAAAAAAAEAAAfQAAAABEJvbmQ=",
        "AAAAAAAAAAAAAAAIY3VycmVuY3kAAAAAAAAAAQAAABM=",
        "AAAAAAAAAAAAAAAMZGVub21pbmF0aW9uAAAAAAAAAAEAAAAL",
        "AAAAAAAAAAAAAAAJZnJlcXVlbmN5AAAAAAAAAAAAAAEAAAAG",
        "AAAAAAAAAAAAAAANaW50ZXJlc3RfcmF0ZQAAAAAAAAAAAAABAAAACw==",
        "AAAAAAAAAAAAAAAKaXNzdWVfZGF0ZQAAAAAAAAAAAAEAAAAG",
        "AAAAAAAAAAAAAAANbWF0dXJpdHlfZGF0ZQAAAAAAAAAAAAABAAAABg==",
        "AAAAAAAAAAAAAAALaXNzdWVyX2luZm8AAAAAAAAAAAEAAAfQAAAABklzc3VlcgAA" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
        set_bond: this.txFromJSON<null>,
        set_issuer: this.txFromJSON<null>,
        institution: this.txFromJSON<string>,
        cnpj: this.txFromJSON<string>,
        lei: this.txFromJSON<string>,
        bond_info: this.txFromJSON<Bond>,
        currency: this.txFromJSON<string>,
        denomination: this.txFromJSON<i128>,
        frequency: this.txFromJSON<u64>,
        interest_rate: this.txFromJSON<i128>,
        issue_date: this.txFromJSON<u64>,
        maturity_date: this.txFromJSON<u64>,
        issuer_info: this.txFromJSON<Issuer>
  }
}