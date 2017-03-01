#!/usr/bin/env python
# -*- coding: utf-8 -*-

import codecs
import sys
import os
import os.path
import json
import operator

_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
_VOWELS = "AEIOU"
_COLLAPSES = "' "

_VH_VOWEL = 'v'
_VH_CONSONANT = 'c'
_VH_OTHER = 'y'

_MAPPINGS = {
    u'Á': 'A',
    u'Í': 'I',
    u'Â': 'A',
    u'Å': 'A',
    u'Ä': 'A',
    u'É': 'E',
    u'È': 'E',
    u'Ê': 'E',
    u'Ç': 'C',
    u'Ñ': 'N',
    u'Ó': 'O',
    u'Ô': 'O',
    u'Ö': 'O',
    u'Û': 'U',
    u'Ü': 'U',    
}

_KEY_RENDERINGS = 'rs'
_KEY_SEQ = 'sq'
_KEY_VOWEL_PATTERN = 'vp'

def vowelhood(ch):
    if ch in _VOWELS:
        return _VH_VOWEL
    if ch == 'Y':
        return _VH_OTHER
    return _VH_CONSONANT

def sequencify(word):
    word = word.upper()
    for c in _COLLAPSES:
        word = word.replace(c, '')
    chars = word.split()
    for i in xrange(len(chars)):
        if chars[i] in _MAPPINGS:
            chars[i] = _MAPPINGS[chars[i]]
    return ''.join(chars)

def make_asset(word, sequence, args):
    asset = {
        _KEY_SEQ: sequence
    }
    if args.vowel_pattern:
        vowel_pattern = []
        for i in xrange(len(sequence)):
            vh = vowelhood(sequence[i])
            vowel_pattern.append(vh)
        asset[_KEY_VOWEL_PATTERN] = ''.join(vowel_pattern)
    asset[_KEY_RENDERINGS] = [word]
    return asset

def keep(word):
    if word.lower().endswith("'s"):
        return False
    return True

if __name__ == '__main__':
    from argparse import ArgumentParser
    p = ArgumentParser()
    p.add_argument("wordlist", nargs="?", metavar="FILE", default='/usr/share/dict/words', help="input word list (plain text)")
    p.add_argument("--input-charset", metavar="CHARSET", default='utf-8', help="input word list charset")
    p.add_argument("--output-charset", metavar="CHARSET", default='utf-8', help="set charset for json output")
    p.add_argument("--output", "-o", metavar="FILE", default=os.path.join(os.getcwd(), 'assets-utf8.json'), help="set output path")
    p.add_argument("--vowel-pattern", action="store_true", default=False, help="include vowel pattern")
    p.add_argument("--pretty", action="store_const", const=2, default=None, help="make pretty json")
    args = p.parse_args()
    nonalphas = set()
    with codecs.open(args.wordlist, 'rb', 'utf-8') as ifile:
        words = filter(keep, [line.strip() for line in ifile])
    asset_map = {}
    for word in words:
        sequence = sequencify(word)
        if sequence in asset_map:
            asset_map[sequence][_KEY_RENDERINGS].append(word)
        else:
            asset_map[sequence] = make_asset(word, sequence, args)
    assets = [asset_map[k] for k in asset_map]
    assets.sort(key=operator.itemgetter(_KEY_SEQ))
    with codecs.open(args.output, 'wb', args.output_charset) as ofile:
        json.dump(assets, ofile, indent=args.pretty)
