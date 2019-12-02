import SockerIo from "socket.io";
import logs from "../logs";

interface SocketReturn<R> {
  data?: R;
  error?: string;
}

/* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
export function SocketRouter(socket: SockerIo.Socket) {
  /* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
  return function route<T, R>(
    routePath: string,
    handler: (arg: T) => Promise<R>
  ) {
    socket.on(
      routePath,
      async (arg: T, acknowledgment: (res: SocketReturn<R>) => void) => {
        let data: R | undefined = undefined;
        let error = "";
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
