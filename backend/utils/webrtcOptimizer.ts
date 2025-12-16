/**
 * WebRTC Connection Optimizer
 * Optimizes peer connections and reduces latency
 */

interface OptimizationConfig {
  preferredCodec?: string;
  enableAdaptiveBitrate?: boolean;
  maxBandwidth?: number;
  iceServers?: RTCIceServer[];
}

interface ConnectionMetrics {
  latency: number;
  bandwidth: number;
  packetLoss: number;
  jitter: number;
}

class WebRTCOptimizer {
  private peerConnections: Map<string, RTCPeerConnection>;
  private config: OptimizationConfig;
  private metrics: Map<string, ConnectionMetrics>;

  constructor(config: OptimizationConfig = {}) {
    this.peerConnections = new Map();
    this.metrics = new Map();
    this.config = {
      preferredCodec: 'vp9',
      enableAdaptiveBitrate: true,
      maxBandwidth: 2500, // kbps
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302'] },
        { urls: ['stun:stun1.l.google.com:19302'] },
      ],
      ...config,
    };
  }

  /**
   * Create optimized peer connection
   */
  createOptimizedConnection(peerId: string): RTCPeerConnection {
    const config: RTCConfiguration = {
      iceServers: this.config.iceServers,
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    };

    const peerConnection = new RTCPeerConnection(config);
    this.peerConnections.set(peerId, peerConnection);
    this.setupMonitoring(peerId, peerConnection);

    return peerConnection;
  }

  /**
   * Setup connection quality monitoring
   */
  private setupMonitoring(peerId: string, peerConnection: RTCPeerConnection): void {
    const monitoringInterval = setInterval(async () => {
      try {
        const stats = await peerConnection.getStats();
        const metrics = this.calculateMetrics(stats);
        this.metrics.set(peerId, metrics);

        // Apply adaptive bitrate if enabled
        if (this.config.enableAdaptiveBitrate) {
          this.adjustBitrate(peerId, metrics);
        }
      } catch (error) {
        console.error('Error monitoring connection:', error);
      }
    }, 1000);

    // Clear interval on connection close
    peerConnection.addEventListener('connectionstatechange', () => {
      if (peerConnection.connectionState === 'closed' ||
          peerConnection.connectionState === 'failed') {
        clearInterval(monitoringInterval);
      }
    });
  }

  /**
   * Calculate connection metrics
   */
  private calculateMetrics(stats: RTCStatsReport): ConnectionMetrics {
    let latency = 0;
    let bandwidth = 0;
    let packetLoss = 0;
    let jitter = 0;

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp') {
        jitter = (report as any).jitter || 0;
        packetLoss = (report as any).packetsLost || 0;
      }
      if (report.type === 'candidate-pair' && (report as any).state === 'succeeded') {
        latency = (report as any).currentRoundTripTime * 1000 || 0;
        bandwidth = ((report as any).availableOutgoingBitrate / 1000) || 0;
      }
    });

    return { latency, bandwidth, packetLoss, jitter };
  }

  /**
   * Adjust bitrate based on connection quality
   */
  private adjustBitrate(peerId: string, metrics: ConnectionMetrics): void {
    const peerConnection = this.peerConnections.get(peerId);
    if (!peerConnection) return;

    let targetBitrate = this.config.maxBandwidth || 2500;

    // Reduce bitrate if packet loss is high
    if (metrics.packetLoss > 0.02) {
      targetBitrate *= 0.8;
    }
    // Increase bitrate if conditions are good
    else if (metrics.packetLoss < 0.005 && metrics.latency < 50) {
      targetBitrate *= 1.1;
    }

    // Apply bitrate constraints
    const senders = peerConnection.getSenders();
    senders.forEach((sender) => {
      if (sender.track?.kind === 'video') {
        sender.setParameters({
          encodings: [{ maxBitrate: targetBitrate * 1000 }],
        });
      }
    });
  }

  /**
   * Get connection metrics
   */
  getMetrics(peerId: string): ConnectionMetrics | undefined {
    return this.metrics.get(peerId);
  }

  /**
   * Close peer connection
   */
  closeConnection(peerId: string): void {
    const peerConnection = this.peerConnections.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(peerId);
      this.metrics.delete(peerId);
    }
  }
}

export default WebRTCOptimizer;
