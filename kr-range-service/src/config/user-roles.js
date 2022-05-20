module.exports = {
  'prod': {
    '/export/reports': {
      description: 'This role is to manage access for export API',
      groups: [
        { name: 'AP-Ranging-Khub-Write', id: '6e6aacf3-bed8-4548-ab2f-362ae644135d' },
        { name: 'AP-Ranging-Khub-Read', id: 'd6964b1e-bd6b-4a29-9231-59f7832225a3' },
        { name: 'AP-Ranging-Fleet-Write', id: '79dd3dc2-b5e5-4228-a46c-02236340bda5' },
        { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' },
        { name: 'AP-Github-rangingtool', id: '2785797d-6b18-4bed-8568-60f64968d5ae' }
      ]
    },
    '/export': {
      description: 'This role is to manage access for export API',
      groups: [
        { name: 'AP-Ranging-Khub-Write', id: '6e6aacf3-bed8-4548-ab2f-362ae644135d' },
        { name: 'AP-Ranging-Khub-Read', id: 'd6964b1e-bd6b-4a29-9231-59f7832225a3' },
        { name: 'AP-Github-rangingtool', id: '2785797d-6b18-4bed-8568-60f64968d5ae' },
        { name: 'AP-Ranging-Fleet-Write', id: '79dd3dc2-b5e5-4228-a46c-02236340bda5' },
        { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }
      ]
    },
    '/upload': {
      description: 'This role is to manage access for upload API',
      groups: [
        { name: 'AP-Ranging-Khub-Write', id: '6e6aacf3-bed8-4548-ab2f-362ae644135d' },
        { name: 'AP-Ranging-Fleet-Write', id: '79dd3dc2-b5e5-4228-a46c-02236340bda5' }
      ]
    },
    '/export/reports/:uid': {
      description: 'This role is to manage access for export reports API',
      groups: [
        { name: 'AP-Ranging-Khub-Write', id: '6e6aacf3-bed8-4548-ab2f-362ae644135d' },
        { name: 'AP-Ranging-Khub-Read', id: 'd6964b1e-bd6b-4a29-9231-59f7832225a3' },
        { name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
        { name: 'AP-Ranging-Fleet-Write', id: '79dd3dc2-b5e5-4228-a46c-02236340bda5' },
        { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }
      ]
    },
    '/tagged-products': {
      description: 'This role is to manage access for tagged products API',
      groups: [
        { name: 'AP-Ranging-Khub-Write', id: '6e6aacf3-bed8-4548-ab2f-362ae644135d' },
        { name: 'AP-Ranging-Khub-Read', id: 'd6964b1e-bd6b-4a29-9231-59f7832225a3' },
        { name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
        { name: 'AP-Ranging-Fleet-Write', id: '79dd3dc2-b5e5-4228-a46c-02236340bda5' },
        { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }
      ]
    },
    '/productFilters': {
      description: 'This role is to manage access for product filters API',
      groups: [
        { name: 'AP-Ranging-Khub-Write', id: '6e6aacf3-bed8-4548-ab2f-362ae644135d' },
        { name: 'AP-Ranging-Khub-Read', id: 'd6964b1e-bd6b-4a29-9231-59f7832225a3' },
        { name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
        { name: 'AP-Ranging-Fleet-Write', id: '79dd3dc2-b5e5-4228-a46c-02236340bda5' },
        { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }
      ]
    },
    '/product/tag': {
      description: 'This role is to manage access for tagging API',
      groups: [
        { name: 'AP-Ranging-Khub-Write', id: '6e6aacf3-bed8-4548-ab2f-362ae644135d' },
        { name: 'AP-Ranging-Fleet-Write', id: '79dd3dc2-b5e5-4228-a46c-02236340bda5' }
      ]
    },
    '/periodList': {
      escription: 'This role is to manage access for period list API',
      groups: [
        { name: 'AP-Ranging-Khub-Write', id: '6e6aacf3-bed8-4548-ab2f-362ae644135d' },
        { name: 'AP-Ranging-Khub-Read', id: 'd6964b1e-bd6b-4a29-9231-59f7832225a3' },
        { name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
        { name: 'AP-Ranging-Fleet-Write', id: '79dd3dc2-b5e5-4228-a46c-02236340bda5' },
        { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }
      ]
    },
    '/lock/acquireOrRelease': {
      description: 'This role is to manage access to acquire or release lock API',
      groups: [
        { name: 'AP-Ranging-Khub-Write', id: '6e6aacf3-bed8-4548-ab2f-362ae644135d' },
        { name: 'AP-Ranging-Fleet-Write', id: '79dd3dc2-b5e5-4228-a46c-02236340bda5' }
      ]
    },
    '/lock/state': {
      description: 'This role is to manage access for lock state API',
      groups: [
        { name: 'AP-Ranging-Khub-Write', id: '6e6aacf3-bed8-4548-ab2f-362ae644135d' },
        { name: 'AP-Ranging-Khub-Read', id: 'd6964b1e-bd6b-4a29-9231-59f7832225a3' },
        { name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
        { name: 'AP-Ranging-Fleet-Write', id: '79dd3dc2-b5e5-4228-a46c-02236340bda5' },
        { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }
      ]
    },
    '/userAccessType': {
      description: 'This role is to manage access for user access type API',
      groups: [
        { name: 'AP-Ranging-Khub-Write', id: '6e6aacf3-bed8-4548-ab2f-362ae644135d' },
        { name: 'AP-Ranging-Khub-Read', id: 'd6964b1e-bd6b-4a29-9231-59f7832225a3' },
        { name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
        { name: 'AP-Ranging-Fleet-Write', id: '79dd3dc2-b5e5-4228-a46c-02236340bda5' },
        { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }
      ]
    },
    '/updateUserSocketDetails': {
      description: 'This role is to manage access for updating user socket details API',
      groups: [
        { name: 'AP-Ranging-Khub-Write', id: '6e6aacf3-bed8-4548-ab2f-362ae644135d' },
        { name: 'AP-Ranging-Khub-Read', id: 'd6964b1e-bd6b-4a29-9231-59f7832225a3' },
        { name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
        { name: 'AP-Ranging-Fleet-Write', id: '79dd3dc2-b5e5-4228-a46c-02236340bda5' },
        { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }
      ]
    },
    '/deleteSocketDetails': {
      description: 'This role is to manage access for deleting socket details API',
      groups: [
        { name: 'AP-Ranging-Khub-Write', id: '6e6aacf3-bed8-4548-ab2f-362ae644135d' },
        { name: 'AP-Ranging-Khub-Read', id: 'd6964b1e-bd6b-4a29-9231-59f7832225a3' },
        { name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
        { name: 'AP-Ranging-Fleet-Write', id: '79dd3dc2-b5e5-4228-a46c-02236340bda5' },
        { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }
      ]
    },
    '/updateUserState': {
      description: 'This role is to manage access for updating user state API',
      groups: [
        { name: 'AP-Ranging-Khub-Write', id: '6e6aacf3-bed8-4548-ab2f-362ae644135d' },
        { name: 'AP-Ranging-Khub-Read', id: 'd6964b1e-bd6b-4a29-9231-59f7832225a3' },
        { name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
        { name: 'AP-Ranging-Fleet-Write', id: '79dd3dc2-b5e5-4228-a46c-02236340bda5' },
        { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }
      ]
    }
  },
  'dev': {
    '/export/reports': {
      description: 'This role is to manage access for export API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/export': {
      description: 'This role is to manage access for export API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/upload': {
      description: 'This role is to manage access for upload API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/export/reports/:uid': {
      description: 'This role is to manage access for export reports API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/tagged-products': {
      description: 'This role is to manage access for tagged products API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/productFilters': {
      description: 'This role is to manage access for product filters API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/product/tag': {
      description: 'This role is to manage access for tagging API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/periodList': {
      description: 'This role is to manage access for period list API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/lock/acquireOrRelease': {
      description: 'This role is to manage access to acquire or release lock API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/lock/state': {
      description: 'This role is to manage access for lock state API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/userAccessType': {
      description: 'This role is to manage access for user access type API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/updateUserSocketDetails': {
      description: 'This role is to manage access for updating user socket details API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/deleteSocketDetails': {
      description: 'This role is to manage access for deleting socket details API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/updateUserState': {
      description: 'This role is to manage access for updating user state API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    }
  },
  'nonprod': {
    '/export/reports': {
      description: 'This role is to manage access for export API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/export': {
      description: 'This role is to manage access for export API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/upload': {
      description: 'This role is to manage access for upload API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/export/reports/:uid': {
      description: 'This role is to manage access for export reports API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/tagged-products': {
      description: 'This role is to manage access for tagged products API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/productFilters': {
      description: 'This role is to manage access for product filters API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/product/tag': {
      description: 'This role is to manage access for tagging API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/periodList': {
      description: 'This role is to manage access for period list API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/lock/acquireOrRelease': {
      description: 'This role is to manage access to acquire or release lock API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/lock/state': {
      description: 'This role is to manage access for lock state API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/userAccessType': {
      description: 'This role is to manage access for user access type API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/updateUserSocketDetails': {
      description: 'This role is to manage access for updating user socket details API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/deleteSocketDetails': {
      description: 'This role is to manage access for deleting socket details API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    },
    '/updateUserState': {
      description: 'This role is to manage access for updating user state API',
      groups: [{ name: 'AP-Ranging-Test', id: 'e984e582-382c-476d-b50b-6aa700c51bbd' },
      { name: 'AP-Ranging-Fleet-Read', id: '32e55e83-9a67-48af-8a3c-c243624f7d4a' }]
    }
  }
}
