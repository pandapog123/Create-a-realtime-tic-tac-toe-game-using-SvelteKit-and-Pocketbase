import { pb } from "$lib/pocketbase";
import PocketBase from "pocketbase";

export const handle = async ({ event, resolve }) => {
  event.locals.pocketBase = new PocketBase("http://127.0.0.1:8090");

  pb.set(event.locals.pocketBase);

  event.locals.pocketBase.authStore.loadFromCookie(
    event.request.headers.get("cookie") ?? ""
  );

  const response = await resolve(event);

  response.headers.set(
    "set-cookie",
    event.locals.pocketBase.authStore.exportToCookie({ secure: false })
  );

  return response;
};
