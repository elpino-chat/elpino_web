// The browser half of a voice call, shared by the dashboard (the caller) and the widget (the callee) so both
// sides negotiate the same way. It carries no framework code: the caller owns a WebRTC peer connection, hands
// every signalling message it produces to `send` (the gateway relays it to the other side untouched), and
// feeds the ones it receives to `handleSignal`. The audio itself flows directly between the two browsers.

export type PeerSignal =
  | { kind: "description"; description: RTCSessionDescriptionInit }
  | { kind: "candidate"; candidate: RTCIceCandidateInit | null };

export type CallPeerOptions = {
  role: "caller" | "callee";
  iceServers: RTCIceServer[];
  stream: MediaStream;
  send: (signal: PeerSignal) => void;
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionState: (state: RTCPeerConnectionState) => void;
};

export class CallPeer {
  private readonly connection: RTCPeerConnection;
  // Candidates that arrive before the remote description is set wait here instead of being dropped.
  private pendingCandidates: RTCIceCandidateInit[] = [];
  private closed = false;

  constructor(private readonly options: CallPeerOptions) {
    this.connection = new RTCPeerConnection({ iceServers: options.iceServers });
    for (const track of options.stream.getTracks()) this.connection.addTrack(track, options.stream);

    this.connection.onicecandidate = (event) => {
      if (this.closed) return;
      options.send({ kind: "candidate", candidate: event.candidate ? event.candidate.toJSON() : null });
    };
    this.connection.ontrack = (event) => {
      const [remote] = event.streams;
      if (remote) options.onRemoteStream(remote);
    };
    this.connection.onconnectionstatechange = () => {
      if (!this.closed) options.onConnectionState(this.connection.connectionState);
    };
  }

  // The caller opens the negotiation once the other side has said yes.
  async start() {
    if (this.options.role !== "caller") return;
    const offer = await this.connection.createOffer();
    await this.connection.setLocalDescription(offer);
    this.options.send({ kind: "description", description: this.connection.localDescription ?? offer });
  }

  async handleSignal(signal: PeerSignal) {
    if (this.closed) return;
    if (signal.kind === "description") {
      await this.connection.setRemoteDescription(signal.description);
      for (const candidate of this.pendingCandidates.splice(0)) await this.connection.addIceCandidate(candidate).catch(() => undefined);
      if (signal.description.type === "offer") {
        const answer = await this.connection.createAnswer();
        await this.connection.setLocalDescription(answer);
        this.options.send({ kind: "description", description: this.connection.localDescription ?? answer });
      }
    } else if (signal.candidate) {
      if (this.connection.remoteDescription) await this.connection.addIceCandidate(signal.candidate).catch(() => undefined);
      else this.pendingCandidates.push(signal.candidate);
    }
  }

  setMuted(muted: boolean) {
    for (const track of this.options.stream.getAudioTracks()) track.enabled = !muted;
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    this.connection.onicecandidate = null;
    this.connection.ontrack = null;
    this.connection.onconnectionstatechange = null;
    try { this.connection.close(); } catch { /* already closed */ }
  }
}

// Asks for the microphone, with the reason in plain words when it cannot be had.
export async function requestMicrophone(): Promise<MediaStream> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("This browser cannot make calls here. Calls need a secure (https) page.");
  }
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  } catch (error) {
    const name = (error as { name?: string } | null)?.name;
    if (name === "NotAllowedError" || name === "SecurityError") throw new Error("Microphone access was blocked. Allow it in the browser's address bar and try again.");
    if (name === "NotFoundError" || name === "OverconstrainedError") throw new Error("No microphone was found.");
    throw new Error("Could not start the microphone.");
  }
}

export function stopStream(stream: MediaStream | null | undefined) {
  for (const track of stream?.getTracks() ?? []) track.stop();
}

// Plays the other side's voice. Kept off the page's DOM so nothing the host site does can restyle or remove it.
export function playRemoteAudio(stream: MediaStream): HTMLAudioElement {
  const audio = new Audio();
  audio.autoplay = true;
  audio.srcObject = stream;
  void audio.play().catch(() => undefined);
  return audio;
}

export function stopRemoteAudio(audio: HTMLAudioElement | null) {
  if (!audio) return;
  audio.pause();
  audio.srcObject = null;
}

export function formatTalkTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

// What the dashboard says when a call ends other than by the teammate's own hang-up.
export function endedMessage(state: string): string {
  switch (state) {
    case "declined": return "The customer declined the call.";
    case "missed": return "No answer. The customer didn't pick up.";
    case "cancelled": return "Call cancelled.";
    case "taken": return "The customer answered on another tab.";
    case "failed": return "The call could not connect.";
    default: return "Call ended.";
  }
}
