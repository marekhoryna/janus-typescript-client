declare namespace JanusJS {
    interface Dependencies {
        adapter: any;
        newWebSocket: (server: string, protocol: string) => WebSocket;
        isArray: (array: any) => array is Array<any>;
        checkJanusExtension: () => boolean;
        httpAPICall: (url: string, options: any) => void;
    }

    enum DebugLevel {
        Trace = 'trace',
        Debug = 'debug',
        Log = 'log',
        Warning = 'warn',
        Error = 'error'
    }

    interface JSEP { }

    interface InitOptions {
        debug?: boolean | 'all' | DebugLevel[];
        callback?: Function;
        dependencies?: Dependencies;
    }

    interface ConstructorOptions {
        server: string | string[];
        iceServers?: RTCIceServer[];
        ipv6?: boolean;
        withCredentials?: boolean;
        max_poll_events?: number;
        destroyOnUnload?: boolean;
        token?: string;
        apisecret?: string;
        success?: Function;
        error?: (error: any) => void;
        destroyed?: Function;
    }

    enum MessageType {
        Recording = 'recording',
        Starting = 'starting',
        Started = 'started',
        Stopped = 'stopped',
        SlowLink = 'slow_link',
        Preparing = 'preparing',
        Refreshing = 'refreshing'
    }

    interface Message {
        result?: {
            status: MessageType;
            id?: string;
            uplink?: number;
        };
        error?: Error;
    }

    interface PluginOptions {
        plugin: string;
        opaqueId?: string;
        success?: (handle: PluginHandle) => void;
        error?: (error: any) => void;
        consentDialog?: (on: boolean) => void;
        webrtcState?: (isConnected: boolean) => void;
        iceState?: (state: 'connected' | 'failed') => void;
        mediaState?: (state: { type: 'audio' | 'video'; on: boolean }) => void;
        slowLink?: (state: { uplink: boolean }) => void;
        onmessage?: (message: Message, jsep?: JSEP) => void;
        onlocalstream?: (stream: MediaStream) => void;
        onremotestream?: (stream: MediaStream) => void;
        ondataopen?: Function;
        ondata?: Function;
        oncleanup?: Function;
        detached?: Function;
    }

    interface OfferParams {
        media?: {
            audioSend?: boolean;
            audioRecv?: boolean;
            videoSend?: boolean;
            videoRecv?: boolean;
            audio?: boolean | { deviceId: string };
            video?:
            | boolean
            | { deviceId: string }
            | 'lowres'
            | 'lowres-16:9'
            | 'stdres'
            | 'stdres-16:9'
            | 'hires'
            | 'hires-16:9';
            data?: boolean;
            failIfNoAudio?: boolean;
            failIfNoVideo?: boolean;
            screenshareFrameRate?: number;
        };
        trickle?: boolean;
        stream?: MediaStream;
        success: Function;
        error: (error: any) => void;
    }

    interface PluginMessage {
        message: {
            request: string;
            [otherProps: string]: any;
        };
        jsep?: JSEP;
        [otherProps: string]: any;
    }

    interface PluginHandle {
        getId(): string;
        getPlugin(): string;
        send(message: PluginMessage): void;
        createOffer(params: any): void;
        createAnswer(params: any): void;
        handleRemoteJsep(params: { jsep: JSEP }): void;
        dtmf(params: any): void;
        data(params: any): void;
        isVideoMuted(): boolean;
        muteVideo(): void;
        unmuteVideo(): void;
        getBitrate(): number;
        hangup(sendRequest?: boolean): void;
        detach(params: any): void;
    }

    class Janus {
        static useDefaultDependencies(deps: Partial<Dependencies>): Dependencies;
        static useOldDependencies(deps: Partial<Dependencies>): Dependencies;
        static init(options: InitOptions): void;
        static isWebrtcSupported(): boolean;
        static debug(...args: any[]): void;
        static log(...args: any[]): void;
        static warn(...args: any[]): void;
        static error(...args: any[]): void;
        static randomString(length: number): string;
        static attachMediaStream(videoElement: HTMLVideoElement, stream: MediaStream): void;

        /**
         * an adapter object such as provided by [the webrtc-adapter library](https://github.com/webrtc/adapter)
         */
        static webRTCAdapter: {
            browserDetails: {
                browser: string
            }
        };

        constructor(options: ConstructorOptions);

        getServer(): string;
        isConnected(): boolean;
        getSessionId(): string;
        attach(options: StreamingPluginOptions): void;
        attach(options: PluginOptions): void;
    }

    namespace StreamingPlugin {

        interface ListStreamRequestMessage extends PluginMessage {
            message: { request: "list" };
            success: (result?: ListStreamResponse) => void;
        }

        interface ListStreamResponseEntry {
            /**
             * unique ID of mountpoint
             */
            "id": number;

            /**
             * type of mountpoint, in line with the types introduced above
             */
            "type": 'rtp' | 'live' | 'ondemand' | 'rtsp';

            /**
             * description of mountpoint
             */
            "description": string;

            /**
             * metadata of mountpoint, if any
             */
            "metadata"?: string;

            /**
             * depending on whether the mountpoint is currently enabled or not
             */
            "enabled": boolean;

            /**
             * how much time passed since we last received audio; optional, available for RTP mountpoints only
             */
            "audio_age_ms": number;

            /**
             * how much time passed since we last received video; optional, available for RTP mountpoints only
             */
            "video_age_ms": number;
        }

        interface ListStreamResponse {
            streaming: "list";
            list: ListStreamResponseEntry[];
        }

        interface StreamInfoRequestMessage extends PluginMessage {
            message: { request: "info" };
            success: (result?: StreamInfoResponse) => void;
        }
        interface StreamInfo {
            /**
             * unique ID of mountpoint
             */
            "id": number;

            /**
             * unique name of mountpoint
             */
            "name": string;
            /**
            * description of mountpoint
            */
            "description": string;
            /**
             * metadata of mountpoint, if any
             */
            "metadata"?: string;

            /**
             * depending on whether the mountpoint is currently enabled or not
             */
            "enabled": boolean;

            /**
             * depending on whether the mountpoint is listable; only available if a valid secret was provided
             */
            "is_private": boolean;

            /**
             * count of current subscribers, if any
             */
            "viewers": number;

            /**
             * true, only present if the mountpoint contains audio
             */
            "audio"?: boolean;

            /**
             * audio payload type, only present if configured and the mountpoint contains audio
             */
            "audiopt"?: string;

            /**
             * audio SDP rtpmap value, only present if configured and the mountpoint contains audio
             */
            "audiortpmap"?: string;

            /**
             * audio SDP fmtp value, only present if configured and the mountpoint contains audio
             */
            "audiofmtp"?: string;

            /**
             * true, only present if the mountpoint contains video
             */
            "video"?: boolean;

            /**
             * video payload type, only present if configured and the mountpoint contains video
             */
            "videopt"?: string;

            /**
             * video SDP rtpmap value, only present if configured and the mountpoint contains video
             */
            "videortpmap"?: string;

            /**
             * video SDP fmtp value, only present if configured and the mountpoint contains video
             */
            "videofmtp"?: string;
        }

        interface StreamInfoResponse {
            streaming: "info";
            info: StreamInfo;
        }

        interface StreamingPluginOptions extends PluginOptions {
            plugin: "janus.plugin.streaming",
            success: (streamingPlugin: StreamingPluginHandle) => void;
        }

        interface StreamingPluginHandle extends PluginHandle {
            send(message: ListStreamRequestMessage): void;
            send(message: StreamInfoRequestMessage): void;
        }
    }
}

export default JanusJS.Janus;
export { JanusJS };
