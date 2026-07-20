export class GetUsersQuery {
  constructor(
    public readonly params: {
      pageNumber: number;
      pageSize: number;
    },
  ) {}
}