import stanza

def load_model():
    model_lang = 'en'
    model_dir = 'models'
    # base model
    stanza.download(model_lang, model_dir)
    # processors
    stanza.Pipeline(lang=model_lang,
                    dir=model_dir,
                    processors='tokenize,mwt,pos,lemma,ner,sentiment,depparse,coref',
                    tokenize_no_ssplit=True)