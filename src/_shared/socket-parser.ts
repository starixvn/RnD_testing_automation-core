export enum PacketType {
    CONNECT,
    DISCONNECT,
    EVENT,
    ACK,
    CONNECT_ERROR,
    BINARY_EVENT,
    BINARY_ACK,
}

export enum TransportType {
    OPEN,
    CLOSE,
    PING,
    PONG,
    MESSAGE,
    UPGRADE,
    NOOP,
}

export interface Packet {
    transport: string;
    type: PacketType;
    nsp: string;
    data?: any;
    id?: number;
    attachments?: number;
}

export function decodeJson(str: string): Packet {
    let i = 0;

    const p: any = {
        transport: Number(str.charAt(i)),
    };
    ++i;

    if (TransportType[p.transport] === undefined) {
        throw new Error("unknown transport type " + p.type);
    }

    p.type = Number(str.charAt(i));

    if (PacketType[p.type] === undefined) {
        throw new Error("unknown packet type " + p.type);
    }

    // look up namespace (if any)
    if ("/" === str.charAt(i + 1)) {
        const start = i + 1;
        while (++i) {
            const c = str.charAt(i);
            if ("," === c) break;
            if (i === str.length) break;
        }
        p.nsp = str.substring(start, i);
    } else {
        p.nsp = "/";
    }

    // look up json data
    if (str.charAt(++i)) {
        const payload = tryParse(str.substring(i));
        if (isPayloadValid(p.type, payload)) {
            p.data = payload;
        } else {
            throw new Error("invalid payload");
        }
    }

    return p;
}

function isPayloadValid(type: PacketType, payload: any): boolean {
    switch (type) {
        case PacketType.CONNECT:
            return typeof payload === "object";
        case PacketType.DISCONNECT:
            return payload === undefined;
        case PacketType.CONNECT_ERROR:
            return typeof payload === "string" || typeof payload === "object";
        case PacketType.EVENT:
        case PacketType.BINARY_EVENT:
            return Array.isArray(payload) && payload.length > 0;
        case PacketType.ACK:
        case PacketType.BINARY_ACK:
            return Array.isArray(payload);
    }
}

function tryParse(str: string): boolean {
    try {
        return JSON.parse(str);
    } catch (e) {
        return false;
    }
}
