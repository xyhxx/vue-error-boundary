export default {
  get(url: string) {
    switch (url) {
      case 'error':
        return {
          data: {
            status: 'error',
            data: 'network error',
          },
        };
      case 'list':
        return {
          data: {
            status: 'success',
            data: ['item1', 'item2', 'item3'],
          },
        };
    }
  },
};
