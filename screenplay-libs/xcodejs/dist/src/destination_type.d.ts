export declare enum DestinationType {
    debugSimulator = 0,
    releaseDevice = 1
}
export declare function destinationString(destinationType: DestinationType): string;
