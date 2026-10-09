export default {
  fetch(): Response {
    return Response.json(
      { error: { code: 'NOT_FOUND', message: 'Not found.' } },
      { status: 404 },
    );
  },
};
