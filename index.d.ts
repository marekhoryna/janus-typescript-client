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

    interface JSEP {
        type: string;
        sdp: string;
    }

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

        /**
         * returns the address of the server
         */
        getServer(): string;

        /**
         * returns true if the Janus instance is connected to the server, false otherwise;
         */
        isConnected(): boolean;

        /**
         * returns the unique Janus session identifier;
         */
        getSessionId(): string;

        /**
         * attaches the session to the Streaming plugin
         */
        attach(options: StreamingPlugin.StreamingPluginOptions): void;

        /**
         * attaches the session to a plugin, creating a handle; more handles to the same or different plugins can be created at the same time;
         */
        attach(options: PluginOptions): void;

        /**
         * destroys the session with the server, and closes all the handles (and related PeerConnections) the session may have with any plugin as well.
         */
        destroy(): void;
    }

    namespace StreamingPlugin {

        interface ListStreamRequestMessage extends PluginMessage {
            message: { request: "list" };
            success: (result?: ListStreamResponse) => void;
        }

        type StreamType = 'rtp' | 'live' | 'ondemand' | 'rtsp';

        interface ListStreamResponseEntry {
            /**
             * unique ID of mountpoint
             */
            "id": number;

            /**
             * type of mountpoint, in line with the types introduced above
             */
            "type": StreamType;

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
            message: { request: "info", id: number };
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

        interface StartStreamRequestMessage extends PluginMessage {
            message: { request: "start", jsep: JSEP };
            success: (result?: any) => void;
        }

        interface SubscribeToStreamRequestMessage extends PluginMessage {
            message: { request: "watch", id: number };
            success: (result?: any) => void;
        }

        interface StopStreamRequestMessage extends PluginMessage {
            message: { request: "stop" };
            success: (result?: any) => void;
        }

        interface CreateStreamRequestMessage extends PluginMessage {
            message: {
                "request": "create",

                /**
                 * plugin administrator key; mandatory if configured
                 */
                "admin_key"?: string;

                /**
                 * type of mountpoint
                 */
                "type": StreamType;

                /**
                 * unique ID to assign the mountpoint; optional, will be chosen by the server if missing
                 */
                "id"?: number;

                /**
                 * unique name for the mountpoint; optional, will be chosen by the server if missing
                 */
                "name"?: string;

                /**
                 * description of mountpoint; optional
                 */
                "description"?: string;

                /**
                 * metadata of mountpoint; optional
                 */
                "metadata"?: string;

                /**
                 * secret to query/edit the mountpoint later; optional
                 */
                "secret"?: string;

                /**
                 * PIN required for viewers to access mountpoint; optional
                 */
                "pin"?: string;

                /**
                 * whether the mountpoint should be listable; true by default
                 */
                "is_private"?: boolean;

                /**
                 * whether the mountpoint will have audio; false by default
                 */
                "audio"?: boolean;

                /**
                 * whether the mountpoint will have video; false by default
                 */
                "video"?: boolean;

                /**
                 * whether the mountpoint will have datachannels; false by default
                 */
                "data"?: boolean;

                /**
                 * whether the mountpoint should be saved to configuration file or not; false by default
                 */
                "permanent"?: boolean;

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
                 * RTSP stream URL (only for restreaming RTSP)
                 */
                "url"?: string;

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
            };
            success: (result?: CreateStreamResponse) => void;
        }

        interface CreateStreamResponse {
            "streaming": "created";

            /**
             * unique name of the just created mountpoint
             */
            "create": string;

            /**
             * depending on whether the mountpoint was saved to configuration file or not
             */
            "permanent": boolean,
            "stream": {
                /**
                 * unique ID of the just created mountpoint
                 */
                "id": number;

                /**
                 * type of the just created mountpoint
                 */
                "type": StreamType;

                /**
                 * description of the just created mountpoint
                 */
                "description": string;

                /**
                 * depending on whether the new mountpoint is listable
                 */
                "is_private": boolean;
            } & Partial<StreamInfo>;
        }

        /**
         * Plugin handle, as defined here:
         * https://janus.conf.meetecho.com/docs/streaming.html
         */
        interface StreamingPluginHandle extends PluginHandle {

            /**
             * Creates a new stream on server
             */
            send(message: CreateStreamRequestMessage): void;

            /**
             * Fetch available public streams summary
             */
            send(message: ListStreamRequestMessage): void;

            /**
             * Get details about a stream by ID
             */
            send(message: StreamInfoRequestMessage): void;

            /**
             * Subscribe to a stream by ID - this will generate JSEP SDP offer
             */
            send(message: SubscribeToStreamRequestMessage): void;

            /**
             * Start playing a stream by ID according to given SDP
             */
            send(message: StartStreamRequestMessage): void;

            /**
             * Stop playing
             */
            send(message: StopStreamRequestMessage): void;

            send(message: PluginMessage): void;
        }

        interface StreamingPluginOptions extends PluginOptions {
            plugin: "janus.plugin.streaming",
            success: (streamingPlugin: StreamingPluginHandle) => void;
        }
    }
}

export default JanusJS.Janus;
export { JanusJS };
