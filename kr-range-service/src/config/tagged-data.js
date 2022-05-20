exports.columnData = {
  'khub': ['Kmart Style ID', 'Keycode', 'Primary Color', 'Secondary Color', 'DSS ref no', 'Option ID',
    'KHUB', 'KHUB PLUS', 'KHUB MINUS', 'KHUB MAX', 'KHUB SUPER MAXX', 'KHUB ON RANGE DATE', 'KHUB OFF RANGE DATE',
    'KHUB NORTHERN ON RANGE DATES', 'KHUB NORTHERN OFF RANGE DATES', 'KHUB SOUTHERN ON RANGE DATES',
    'KHUB SOUTHERN OFF RANGE DATES'],
  'kmart': ['Kmart Style ID', 'Keycode', 'Primary Color', 'Secondary Color', 'DSS ref no', 'Option ID',
    'FLEET', 'SMALL FLEET', 'ONLINE', 'ON RANGE DATE', 'OFF RANGE DATE', 'NORTHERN ON RANGE DATES',
    'NORTHERN OFF RANGE DATES', 'SOUTHERN ON RANGE DATES', 'SOUTHERN OFF RANGE DATES']
}

exports.columnHeaders = {
  'khub': ['Department', 'Product Nbr', 'Kmart Style ID', 'Keycode', 'Primary Color', 'Secondary Color', 'Product Description',
    'KHUB MINUS', 'KHUB', 'KHUB PLUS', 'KHUB MAX', 'KHUB SUPER MAXX', 'KHUB ON RANGE DATE', 'KHUB OFF RANGE DATE',
    'KHUB NORTHERN ON RANGE DATES', 'KHUB NORTHERN OFF RANGE DATES', 'KHUB SOUTHERN ON RANGE DATES', 'KHUB SOUTHERN OFF RANGE DATES'],
  'kmart': ['Department', 'Product Nbr', 'Kmart Style ID', 'Keycode', 'Primary Color', 'Secondary Color', 'Product Description',
    'FLEET', 'SMALL FLEET', 'ONLINE', 'ON RANGE DATE', 'OFF RANGE DATE', 'NORTHERN ON RANGE DATES',
    'NORTHERN OFF RANGE DATES', 'SOUTHERN ON RANGE DATES', 'SOUTHERN OFF RANGE DATES']
}

exports.dateColumns = {
  'khub': {
    onRangeDate: 'KHUB ON RANGE DATE',
    offRangeDate: 'KHUB OFF RANGE DATE',
    northernOnRangeDate: 'KHUB NORTHERN ON RANGE DATES',
    northernOffRangeDate: 'KHUB NORTHERN OFF RANGE DATES',
    southernOnRangeDate: 'KHUB SOUTHERN ON RANGE DATES',
    southernOffRangeDate: 'KHUB SOUTHERN OFF RANGE DATES'
  },
  'kmart': {
    onRangeDate: 'ON RANGE DATE',
    offRangeDate: 'OFF RANGE DATE',
    northernOnRangeDate: 'NORTHERN ON RANGE DATES',
    northernOffRangeDate: 'NORTHERN OFF RANGE DATES',
    southernOnRangeDate: 'SOUTHERN ON RANGE DATES',
    southernOffRangeDate: 'SOUTHERN OFF RANGE DATES'
  }
}

exports.getStoreFormatsOnChannel = () => ({
  'khub': ['KHUB MINUS', 'KHUB', 'KHUB PLUS', 'KHUB MAX', 'KHUB SUPER MAXX'],
  'kmart': ['FLEET', 'SMALL FLEET', 'ONLINE']
})

exports.storeFormatCount = {
  'khub': 5,
  'kmart': 3
}

exports.kmartClimateRangeDateProperties = ['NORTHERN ON RANGE DATES', 'NORTHERN OFF RANGE DATES', 'SOUTHERN ON RANGE DATES', 'SOUTHERN OFF RANGE DATES']

exports.propertiesMapping = {
  'KHUB': 'khub',
  'KHUB MINUS': 'khub_minus',
  'KHUB PLUS': 'khub_plus',
  'KHUB MAX': 'khub_max',
  'KHUB SUPER MAXX': 'khub_super_maxx',
  'KHUB ON RANGE DATE': 'khub_on_range_period',
  'KHUB OFF RANGE DATE': 'khub_off_range_period',
  'LSPL': 'lspl',
  'KHUB NORTHERN ON RANGE DATES': 'khub_northern_on_range_period',
  'KHUB SOUTHERN ON RANGE DATES': 'khub_southern_on_range_period',
  'KHUB NORTHERN OFF RANGE DATES': 'khub_northern_off_range_period',
  'KHUB SOUTHERN OFF RANGE DATES': 'khub_southern_off_range_period',
  'SMALL FLEET': 'kmart_small_fleet',
  'ONLINE': 'kmart_online',
  'FLEET': 'kmart_fleet',
  'ON RANGE DATE': 'kmart_on_range_period',
  'OFF RANGE DATE': 'kmart_off_range_period',
  'NORTHERN ON RANGE DATES': 'kmart_northern_on_range_period',
  'SOUTHERN ON RANGE DATES': 'kmart_southern_on_range_period',
  'NORTHERN OFF RANGE DATES': 'kmart_northern_off_range_period',
  'SOUTHERN OFF RANGE DATES': 'kmart_southern_off_range_period',
}

exports.propertiesMappingForPostgresDB = {
  'khub': {
    'khub': 'KHUB',
    'khub_minus': 'KHUB MINUS',
    'khub_plus': 'KHUB PLUS',
    'khub_max': 'KHUB MAX',
    'khub_super_maxx': 'KHUB SUPER MAXX',
    'khub_on_range_period': 'KHUB ON RANGE DATE',
    'khub_off_range_period': 'KHUB OFF RANGE DATE',
    'lspl': 'LSPL'
  }
}

exports.periodDateMapping = {
  'khub': {
    'khub_on_range_period': 'khub_on_range_date',
    'khub_off_range_period': 'khub_off_range_date',
    'khub_northern_on_range_period': 'khub_northern_on_range_dates',
    'khub_southern_on_range_period': 'khub_southern_on_range_dates',
    'khub_northern_off_range_period': 'khub_northern_off_range_dates',
    'khub_southern_off_range_period': 'khub_southern_off_range_dates',
  },
  'kmart': {
    'kmart_on_range_period': 'kmart_on_range_date',
    'kmart_off_range_period': 'kmart_off_range_date',
    'kmart_northern_on_range_period': 'kmart_northern_on_range_dates',
    'kmart_southern_on_range_period': 'kmart_southern_on_range_dates',
    'kmart_northern_off_range_period': 'kmart_northern_off_range_dates',
    'kmart_southern_off_range_period': 'kmart_southern_off_range_dates'
  }
}

exports.khubIPMGroupMapping = {
  'KHUB': 'khub_base',
  'KHUB MINUS': 'khub_minus',
  'KHUB PLUS': 'khub_plus',
  'KHUB MAX': 'khub_max',
  'KHUB SUPER MAXX': 'khub_super_maxx'
}

exports.khubRangeDates = ['KHUB ON RANGE DATE', 'KHUB OFF RANGE DATE']

exports.customMessages = {
  customMessage1: 'If the product is registered as keycode then please upload using a valid keycode and if it is registered as style then please upload using a valid style id.'
}

exports.season = ['Summer', 'Winter', 'Non-Seasonal']

exports.disabledRBUs = ['NON KMART MERCH', 'STORE USE STATY', 'UNUSED DEPARTMENTS']
