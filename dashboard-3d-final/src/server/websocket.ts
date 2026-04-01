import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import Alert from './models/Alert';
import { UserRole } from './types';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

export class WebSocketManager {
  private io: SocketIOServer;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3005'],
        credentials: true,
      },
    });

    this.setupAuth();
    this.setupEventHandlers();
  }

  private setupAuth(): void {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          return next(new Error('JWT_SECRET not configured'));
        }

        const decoded = jwt.verify(token, jwtSecret) as any;
        socket.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name,
        };

        this.userSockets.set(decoded.id, socket.id);
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`🔌 User connected: ${socket.user?.name} (${socket.user?.role})`);

      // Join role-based rooms
      socket.join(`role:${socket.user?.role}`);
      socket.join(`user:${socket.user?.id}`);

      // Send initial unread alerts count
      this.sendUnreadAlertsCount(socket);

      // Handle alert acknowledgment
      socket.on('acknowledge_alert', async (alertId: string) => {
        try {
          const alert = await Alert.findByIdAndUpdate(
            alertId,
            {
              acknowledged: true,
              acknowledgedBy: socket.user?.id,
              acknowledgedAt: new Date(),
            },
            { new: true }
          );

          if (alert) {
            // Notify all connected clients about the update
            this.io.emit('alert_acknowledged', {
              alertId,
              acknowledgedBy: socket.user?.name,
            });

            // Update unread counts
            this.broadcastUnreadCounts();
          }
        } catch (error) {
          console.error('Error acknowledging alert:', error);
          socket.emit('error', { message: 'Failed to acknowledge alert' });
        }
      });

      // Handle patient vitals update
      socket.on('vitals_update', async (data: { patientId: string; vitals: any }) => {
        // Broadcast to all users who have this patient assigned
        this.broadcastToPatientAssigned(data.patientId, 'vitals_updated', {
          patientId: data.patientId,
          vitals: data.vitals,
          updatedBy: socket.user?.name,
          timestamp: new Date(),
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.user?.name}`);
        if (socket.user?.id) {
          this.userSockets.delete(socket.user.id);
        }
      });
    });
  }

  private async sendUnreadAlertsCount(socket: AuthenticatedSocket): Promise<void> {
    try {
      const count = await Alert.countDocuments({ acknowledged: false });
      socket.emit('unread_alerts_count', { count });
    } catch (error) {
      console.error('Error sending unread count:', error);
    }
  }

  private async broadcastUnreadCounts(): Promise<void> {
    try {
      const count = await Alert.countDocuments({ acknowledged: false });
      this.io.emit('unread_alerts_count', { count });
    } catch (error) {
      console.error('Error broadcasting unread counts:', error);
    }
  }

  // Public methods for broadcasting events

  public broadcastAlert(alert: any): void {
    this.io.emit('new_alert', alert);
    this.broadcastUnreadCounts();
  }

  public broadcastToPatientAssigned(patientId: string, event: string, data: any): void {
    // This would check patient assignments and broadcast to relevant users
    // For now, broadcast to admin and nurses
    this.io.to('role:admin').to('role:nurse').emit(event, data);
  }

  public broadcastToRole(role: UserRole, event: string, data: any): void {
    this.io.to(`role:${role}`).emit(event, data);
  }

  public broadcastToUser(userId: string, event: string, data: any): void {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  public broadcastToAll(event: string, data: any): void {
    this.io.emit(event, data);
  }
}
