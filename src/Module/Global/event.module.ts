import { Module } from "@nestjs/common";
import { EventsGateway } from "src/Gateway/event.gateway";


@Module({
    providers: [EventsGateway],
    //   exports: [EventsGateway]
})

export class EventsModule { }