export enum DestinationType {
  debugSimulator,
  releaseDevice,
}

export function destinationString(destinationType: DestinationType): string {
  switch (destinationType) {
    case DestinationType.debugSimulator: {
      return "'platform=iOS Simulator,name=iPhone 12'";
    }
    case DestinationType.releaseDevice: {
      return "'generic/platform=iOS'";
    }
  }
}
