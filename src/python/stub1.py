import json
import os
import io
import sys
import warnings
import traceback

warnings.filterwarnings("ignore", message=r"\[W033\]", category=UserWarning)

input_stream = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')



output_json = json.dumps({"status":"started"}, ensure_ascii=False).encode('utf-8')
sys.stdout.buffer.write(output_json)
print()        


def main(input_json):

    output_json = input_json.copy()
    return output_json



if __name__=='__main__':
    
    input_json = None
    count = 0
    for line in input_stream:
        
        # read json from stdin
        input_json = json.loads(line)
        
        try:
            request = main(input_json) 
            # output = main(input_json)
            count = count+1
            output = {"request": request, "response": {"script":"stub1.py","requestCount": count}}

        except BaseException as ex:
            ex_type, ex_value, ex_traceback = sys.exc_info()            
            
            output = {"error": ''}           
            output['error'] += "Exception type : %s; \n" % ex_type.__name__
            output['error'] += "Exception message : %s\n" %ex_value
            output['error'] += "Exception traceback : %s\n" %"".join(traceback.TracebackException.from_exception(ex).format())
            
            
        
        output_json = json.dumps(output, ensure_ascii=False).encode('utf-8')
        sys.stdout.buffer.write(output_json)
        print()

        