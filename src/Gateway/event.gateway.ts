// event.gateway.ts
import { SubscribeMessage, MessageBody, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from "socket.io"
import { Logger } from '@nestjs/common';


@WebSocketGateway()
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger("message");


    // @SubscribeMessage('events')
    // handleEvent(@MessageBody() data: string): string {
    //     return data;
    // }

    @SubscribeMessage('events')
    handleMessage(client: Socket, payload: string): void {
        console.log("events")

        console.log(payload)

        this.server.emit('msgToClient', payload, client.id);
    }

    afterInit(server: Server) {
        this.logger.log('socket Init');
    }


    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }


}