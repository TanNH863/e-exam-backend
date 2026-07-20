export class BulkCreateUsersCommand {
  constructor(public readonly fileBuffer: Buffer | ArrayBuffer) {}
}