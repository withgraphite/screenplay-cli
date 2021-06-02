import * as t from "retype";

export const actor = t.shape({
  firstName: t.string,
  lastName: t.string,
  profilePicture: t.nullable(t.string),
  email: t.string,
});

export const release = t.shape({
  id: t.string,
  name: t.string,
  createdAt: t.number,
  users: t.number,
  majorVersion: t.number,
  minorVersion: t.number,
  patchVersion: t.number,
  status: t.literals([
    "IN_APP_STORE",
    "NOT_RELEASED",
    "RELEASE_CANDIDATE",
  ] as const),
  newerVersionInAppStore: t.boolean,
  releasedDate: t.nullable(t.number),
  versions: t.array(
    t.shape({
      name: t.string,
      receivingTraffic: t.boolean,
    })
  ),
  buildReport: t.nullable(
    t.shape({
      buildRequest: t.shape({
        buildConfiguration: t.string,
        buildAction: t.string,
        author: t.nullable(actor),
      }),
    })
  ),
});
