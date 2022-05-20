import pandas as pd
mainframe_calendar = pd.read_csv('./raw-data/VJR003_202103261300.csv')
mainframe_calendar = mainframe_calendar.rename(columns={'M_ACTGYR': 'ACC_YEAR',
                                                        'M_ACTGQTR': 'ACC_QUARTER',
                                                        'M_ACTGPRD':'ACC_PERIOD',
                                                        'M_ACTGWK':'ACC_WEEK',
                                                        'M_ACTGWK_RLTV':'ACC_WEEK_RELATIVE',
                                                        'D_END_ACTGWK':'ACC_END_WEEK_DATE',
                                                        'M_GRGYR':'GREGORIAN_YEAR',
                                                        'M_GRGWK':'GREGORIAN_WEEK'
                                                       })
mainframe_calendar['ACC_END_WEEK_DATE'] = pd.to_datetime(mainframe_calendar['ACC_END_WEEK_DATE'], format='%Y-%m-%d')
mainframe_calendar['ACC_START_WEEK_DATE'] = mainframe_calendar['ACC_END_WEEK_DATE'] -  pd.to_timedelta(6, unit='d')
mainframe_calendar['ACC_PERIOD'] =  mainframe_calendar['ACC_PERIOD'].apply(lambda x: '{0:0>2}'.format(x))
mainframe_calendar['ACC_WEEK_RELATIVE'] = mainframe_calendar['ACC_WEEK_RELATIVE'].apply(lambda x: '{0:0>2}'.format(x))
mainframe_calendar['ACC_YEAR'] = pd.to_datetime(mainframe_calendar['ACC_YEAR'], format='%Y')
mainframe_calendar['ACC_YEAR'] = mainframe_calendar['ACC_YEAR'].dt.strftime('%y')
mainframe_calendar['ACC_START_WEEK_DATE'] = pd.to_datetime(mainframe_calendar['ACC_START_WEEK_DATE'], format='%d/%m/%y').dt.strftime('%d/%m/%Y')

mainframe_calendar['ACC_END_WEEK_DATE'] = pd.to_datetime(mainframe_calendar['ACC_END_WEEK_DATE'], format='%d/%m/%y').dt.strftime('%d/%m/%Y')
mainframe_calendar = mainframe_calendar[['ACC_YEAR', 'ACC_PERIOD',
                                         'ACC_WEEK','ACC_START_WEEK_DATE',
                                         'ACC_END_WEEK_DATE','ACC_WEEK_RELATIVE', 'ACC_QUARTER',
                                         'GREGORIAN_YEAR','GREGORIAN_WEEK']]
mainframe_calendar['PWF'] = 'PD' + mainframe_calendar['ACC_PERIOD'] + 'WK' + mainframe_calendar['ACC_WEEK_RELATIVE'] + 'F' + mainframe_calendar['ACC_YEAR']
mainframe_calendar.to_csv('./accounting_calendar.csv', index=False)
