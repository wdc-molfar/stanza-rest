import json
import os
import io
import sys
import warnings
import traceback

import stanza

warnings.filterwarnings("ignore", message=r"\[W033\]", category=UserWarning)

input_stream = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')


# sent analysis func
def sentan(doc):
    predict = doc.sentences[0].sentiment

    if predict == 2:
        emotion = "positive"
    elif predict == 0:
        emotion = "negative"
    else:
        emotion = "neutral"
    return emotion


# depparse funcs
def get_possible_upos_tags():
    return [
        "ADJ",      # adjective
        "ADP",      # adposition
        "ADV",      # adverb
        "AUX",      # auxiliary
        "CCONJ",    # coordinating conjunction
        "DET",      # determiner
        "INTJ",     # interjection
        "NOUN",     # noun
        "NUM",      # numeral
        "PART",     # particle
        "PRON",     # pronoun
        "PROPN",    # proper noun
        "PUNCT",    # punctuation
        "SCONJ",    # subordinating conjunction
        "SYM",      # symbol
        "VERB",     # verb
        "X"         # other
    ]


def depparse(doc):
    nodes = []
    links = []
    categories = get_possible_upos_tags()
    upos_to_category_id_dict = {k: v for v, k in enumerate(categories)}
    categories = [{"name": category} for category in categories]
    for sent_id, sentence in enumerate(doc.sentences, start=1):
        for word in sentence.words:
            nodes.append(dict(
                id=f'{sent_id}-{word.id}',
                name=word.lemma,
                value=word.text,
                category=upos_to_category_id_dict[word.upos],
                coreference=[{"coref_id": chain.chain.index, "is_representative": bool(chain.is_representative)} for chain in word.coref_chains]
            ))
        for (source_word, dependency, target_word) in sentence.dependencies:
            if dependency == 'root':
                continue
            links.append(dict(
                source=f'{sent_id}-{source_word.id}',
                value=dependency,
                target=f'{sent_id}-{target_word.id}'
            ))
    return dict(nodes=nodes, links=links, categories=categories)


def main(input_json):
    model_lang = 'en'
    model_dir = './src/python/models'
    text = input_json['text']
    output_json = input_json.copy()
    nlp = stanza.Pipeline(
        lang=model_lang,
        dir=model_dir,
        processors='tokenize,mwt,pos,lemma,ner,sentiment,depparse,coref',
        download_method=stanza.DownloadMethod.REUSE_RESOURCES,
        logging_level='WARN',
        tokenize_no_ssplit=True,
        use_gpu=True)
    doc = nlp(text)
    mydict = doc.sentences[0].to_dict()
    dump = None
    for dicts in mydict:
         dump = dicts.pop('coref_chains', None)
    sent = sentan(doc)
    depend = depparse(doc)
    output_json = {"request": output_json, "response": {"sentiment": sent, "named_entities": mydict, "dependencies": depend}}
    return output_json


if __name__ == '__main__':

    input_json = None
    for line in input_stream:

        # read json from stdin
        input_json = json.loads(line)

        try:

            output = main(input_json)
        except BaseException as ex:
            ex_type, ex_value, ex_traceback = sys.exc_info()

            output = {"error": ''}
            output['error'] += "Exception type : %s; \n" % ex_type.name
            output['error'] += "Exception message : %s\n" % ex_value
            output['error'] += "Exception traceback : %s\n" % "".join(
                traceback.TracebackException.from_exception(ex).format())

        output_json = json.dumps(output, ensure_ascii=False).encode('utf-8')
        sys.stdout.buffer.write(output_json)
        print()
