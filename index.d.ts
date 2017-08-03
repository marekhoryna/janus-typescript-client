declare class JanusStatic {
  constructor(options: JanusStatic.IJanusOptions);

  getServer(): string;
  isConnected(): boolean;
  getSessionId(): string;
  attach(options: JanusStatic.IJanusPluginOptions): void;
}

declare module JanusStatic {
  export function init(options: IJanusInitOptions): void;
  export function attachMediaStream (element: Element, stream: MediaStream): void;
  export function listDevices(callback: (devices: MediaDeviceInfo[]) => void): void;
  export function isWebrtcSupported(): boolean;
  export function isExtensionEnabled(): boolean;
  export function randomString(length: number): string;

  export interface IJanusOptions {
    server: string;
    iceServers?: string[];
    ipv6?: boolean;
    withCredentials?: boolean;
    max_poll_events?: number;
    destroyOnUnload?: boolean;
    token?: string;
    apisecret?: string;

    success: () => void;
    error: (err: Error) => void;
    destroyed: () => void;
  }

  export interface IJanusInitOptions {
    debug?: boolean;
    callback: Function;
  }

  export interface IJanusPluginOptions {
    plugin: string;
    opaqueId?: string;

    success: (handle: IJanusPluginHandle) => void;
    error: (error: Error) => void;
    consentDialog?: (on?: boolean) => void;
    onmessage?: (message: IMessage, jsep: any) => void;
    onlocalstream?: (stream: any) => void;
    onremotestream?: (stream: any) => void;
    oncleanup?: () => void;
    detached?: () => void;
    ondataopen?: (data: any) => void;
    ondata?: (data: any) => void;
    webrtcState?: (data: any) => void;
    slowLink?: (data: any) => void;
    mediaState?: (data: any) => void;
  }

  export interface IMessage {
    id: number;
    private_id: number;
    display: string;
    videoroom: string;
    publishers?: {
      id: number;
      display: string;
    }[];
    leaving?: number;
    unpublished?: string;
  }

  export interface IJanusPluginHandle {
    getId(): string;
    getPlugin(): string;
    getBitrate(): string;
    send(parameters: any): void;
    createOffer(options: ICreateOfferOptions): void;
    createAnswer(options: IAnswerOfferOptions): void;
    handleRemoteJsep(callbacks: any): void;
    hangup(sendRequest?: boolean): void;
    detach(): void;

    isAudioMuted(): void;
    muteAudio(): void;
    unmuteAudio(): void;

    isVideoMuted(): void;
    muteVideo(): void;
    unmuteVideo(): void;

    webrtcStuff: any;
  }

  export interface ICreateOfferOptions {
    media: {
      audioSend?: boolean;
      audioRecv?: boolean;
      audio?: boolean | {
        deviceId: string;
      };
      videoSend?: boolean;
      videoRecv?: boolean;
      video?: boolean | string | {
        deviceId: string;
        width?: number;
        height?: number;
      };
      data?: boolean;
      failIfNoAudio?: boolean;
      failIfNoVideo?: boolean;
      screenshareFrameRate?: number;
    };
    trickle?: boolean;
    stream?: any;
    success: (jsep: string) => void;
    error: (err: Error) => void;
  }

  export interface IAnswerOfferOptions extends ICreateOfferOptions {
    jsep: string;
  }

  export type MessageType = {
    Attached: 'attached',
    Joined: 'joined',
    Destroyed: 'destroyed',
    Event: 'event',
  };
}

declare module "janus-typescript-client" {
  export = JanusStatic;
}
