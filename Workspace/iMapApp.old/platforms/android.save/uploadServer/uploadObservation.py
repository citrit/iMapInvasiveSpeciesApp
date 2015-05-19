"""==========================================================================
views_gis.py

Handles GIS extent requests
============================================================================="""
"""----------------------------------------
GIS Related Functions

-extent:returns an extent from a request (e.g. county extent from county name)
-------------------------------------------"""
"""import psycopg2
import re
import urlparse
import json"""

def query(search_parameters):
    #Setting up connection to the Database
    HOST = '146.201.97.167'
    SERVER = '146.201.97.167'
    NAME = 'imls_2013'
    USER = 'postgres'
    PASSWORD = 'freac_POST'
    TABLE = 'palmbeach_surface_demo_webmercator'
    connstring = 'host=%s dbname=%s user=%s password=%s' % (HOST, NAME, USER,PASSWORD) 
    conn = 'psycopg2.connect(connstring)'
    curs = 'conn.cursor()'
    
    cols_string = ''
    vals_string = ''
    for parameter in search_parameters:
        params = parameter.split('=')
        cols_string = cols_string + params[0] + ', '
        vals_string = vals_string + params[1] + ', '
    
    #Forming the query
    query = 'INSERT INTO table_name (%s) VALUES (%s)' % (cols_string.rstrip(', '), vals_string.rstrip(', '))
    print query
    
    #Executing the query
    rows = []
    try:
        'curs.execute(query)'
        rows = 'curs.fetchall()'
    except:
        print '*************FAILURE TO EXECUTE QUERY*************'
    'conn.close()'
    
    return 'json.dumps(feature_dictionary)'

def uploadTool(req):
    argument_string = req.args
    arguments = argument_string.split('&')
    json_string = query(arguments)

    return json_string

class r:
    args = 'photourl1=photourl1_2013_11_11_tomcitriniti_95hu9wh2.jpg&photourl2=&photourl3=&photourl4=&photourl5=&photocredit1=&photocredit2=&photocredit3=&photocredit4=&photocredit5=&step_1_data_observer=Yes&step_1_existing_user=&step_2_project=Yes&step_2_project_list=&species_select_type=Plant&step_3_species_list_common=NY-2-136391&step_3_species_common_name=Amur%2520Maple&step_3_species_list_scientific=NY-2-136391&step_3_species_scientific_name=Acer%2520ginnala&step_3_species_id=NY-2-136391&step_4_observed_date=2013-11-11&step_5_coordinate_system=latlon&step_5_coord_x=-75.41016&step_5_coord_y=43.40667&step_5_current_coordinate_x=466789.8428462542&step_5_current_coordinate_x_lon_lat=-75.41016000000012&step_5_current_coordinate_y=4806058.103717405&step_5_current_coordinate_y_lon_lat=43.40667000000026&step_5_current_coordinate_x_mercator=-8394620.6118393&step_5_current_coordinate_y_mercator=5374077.4478864&data_entry_method=On-Line'

uploadTool(r)
