import SockerIo from "socket.io";
import logs from "../logs";

interface SocketReturn<T> {
  data?: T;
  error?: string;
}

export function SocketRouter(socket: SockerIo.Socket) {
  return function route<T, R>(
    routePath: string,
    handler: (arg: T) => Promise<R>
  ) {
    socket.on(
      routePath,
      async (arg: T, acknowledgment: (res: SocketReturn<R>) => void) => {
        let data: any;
        let error: string = "";
        try {
          data = await handler(arg);
        } catch (e) {
          error = e.message;
          logs.error(`Socket ${routePath} error`, e);
        }
        if (acknowledgment) acknowledgment({ data, error });
      }
    );
  };
}
