import stanza
import os

def load_model():
    model_lang = os.environ.get('STANZA_SERVER_LANGUAGES')
    model_dir = os.environ.get('STANZA_RESOURCES_DIR')
    # base model
    stanza.download(model_lang, model_dir)
    # processors
    stanza.Pipeline(lang=model_lang,
                    dir=model_dir,
                    processors='tokenize,mwt,pos,lemma,ner,sentiment,depparse,coref',
                    tokenize_no_ssplit=True,
                    use_gpu=True)