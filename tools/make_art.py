#!/usr/bin/env python3
"""Génère les illustrations SVG du site (mers, prisons, factions, races, traits, armes, métiers)
et les aperçus animés des fruits et des Haki. Tout est dessiné ici : aucune image téléchargée.

Usage : python tools/make_art.py   ->  écrit dans dist/visuals/art/
"""
import math, os, random

OUT = os.path.join(os.path.dirname(__file__), '..', 'dist', 'visuals', 'art')
os.makedirs(OUT, exist_ok=True)


def write(name, w, h, body, defs='', style=''):
    st = f'<style>{style}@media (prefers-reduced-motion:reduce){{*{{animation:none!important}}}}</style>' if style else ''
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img">{st}<defs>{defs}</defs>{body}</svg>'
    with open(os.path.join(OUT, name + '.svg'), 'w', encoding='utf-8') as f:
        f.write(svg)


def lg(i, stops, x1=0, y1=0, x2=0, y2=1):
    s = ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return f'<linearGradient id="{i}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{s}</linearGradient>'


def rg(i, stops, cx=.5, cy=.5, r=.5):
    s = ''.join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o, c, a in stops)
    return f'<radialGradient id="{i}" cx="{cx}" cy="{cy}" r="{r}">{s}</radialGradient>'


def stars(n, w, h, seed=1, ymax=.6, col='#fff'):
    r = random.Random(seed)
    return ''.join(f'<circle cx="{r.uniform(0, w):.0f}" cy="{r.uniform(0, h * ymax):.0f}" r="{r.uniform(.6, 1.8):.1f}" fill="{col}" opacity="{r.uniform(.3, .9):.2f}"/>' for _ in range(n))


def wave(y, color, amp=8, w=640, h=360, ph=0, op=1, length=80):
    d = f'M0 {h} L0 {y}'
    x = 0
    while x < w + length:
        d += f' q{length / 4:.0f} {-amp} {length / 2:.0f} 0 t{length / 2:.0f} 0'
        x += length
    d += f' L{w} {h} Z'
    return f'<path d="{d}" transform="translate({ph} 0)" fill="{color}" opacity="{op}"/>'


def ship(x, y, s=1, sail='#f4efe6', hull='#3a2a20'):
    return (f'<g transform="translate({x} {y}) scale({s})"><path d="M-34 0 L34 0 L26 14 L-26 14 Z" fill="{hull}"/>'
            f'<rect x="-1.5" y="-46" width="3" height="46" fill="{hull}"/>'
            f'<path d="M3 -44 Q30 -26 3 -6 Z" fill="{sail}"/><path d="M-3 -38 Q-24 -24 -3 -8 Z" fill="{sail}" opacity=".85"/></g>')


BG = lambda a, b: lg('bg', [(0, a), (1, b)])

# ------------------------------------------------------------------ MERS
def seas():
    W, H = 640, 360
    # Forestis : forêts et archipels
    isl = ''.join(f'<ellipse cx="{x}" cy="248" rx="{rx}" ry="{ry}" fill="#12402f"/>' + ''.join(
        f'<path d="M{x + dx} 248 l-14 -{h} l28 0 z" fill="#1d6a45"/>' for dx, h in [(-rx * .5, 52), (0, 70), (rx * .5, 48)]) for x, rx, ry in [(110, 90, 20), (300, 120, 24), (520, 80, 18)])
    write('sea-forestis', W, H,
          f'<rect width="{W}" height="{H}" fill="url(#bg)"/><circle cx="470" cy="120" r="46" fill="url(#sun)"/>{stars(14, W, H, 2, .3)}{isl}'
          f'{wave(250, "#0e5b6b", 7, ph=-20)}{ship(380, 258, .8)}{wave(285, "#0b4a5c", 9, ph=-50, op=.95)}{wave(320, "#083a4a", 10, ph=-10)}',
          BG('#0b2a3b', '#2a7a5a') + rg('sun', [(0, '#fff6c8', 1), (1, '#fff6c8', 0)]))
    # Motley : mosaïque de royaumes
    flags = ''.join(f'<g transform="translate({x} {y})"><rect x="-1" y="-34" width="2" height="34" fill="#2a1830"/><path d="M1 -34 h20 l-5 6 5 6 h-20z" fill="{c}"/></g>' for x, y, c in [(120, 222, '#ff5d73'), (190, 214, '#ffd166'), (260, 224, '#06d6a0'), (430, 220, '#4cc9f0'), (520, 214, '#b388ff')])
    towers = ''.join(f'<rect x="{x}" y="{240 - h}" width="{w_}" height="{h}" fill="#2b1738"/><path d="M{x - 3} {240 - h} l{w_ / 2 + 3} -16 l{w_ / 2 + 3} 16z" fill="{c}"/>' for x, w_, h, c in [(90, 26, 50, '#ff5d73'), (170, 30, 66, '#ffd166'), (240, 24, 44, '#06d6a0'), (410, 28, 58, '#4cc9f0'), (500, 32, 72, '#b388ff')])
    write('sea-motley', W, H,
          f'<rect width="{W}" height="{H}" fill="url(#bg)"/><circle cx="320" cy="210" r="90" fill="url(#sun)"/>{stars(10, W, H, 3, .25)}<rect x="40" y="240" width="560" height="12" fill="#25132f"/>{towers}{flags}'
          f'{wave(252, "#6a2c70", 7)}{ship(210, 280, .7, "#ffd166")}{ship(420, 292, .85, "#ff5d73")}{ship(540, 276, .6, "#4cc9f0")}{wave(300, "#431a58", 9, ph=-30)}{wave(335, "#2a1040", 10)}',
          BG('#3a1b5c', '#ff8a5c') + rg('sun', [(0, '#ffd9a0', 1), (1, '#ffd9a0', 0)]))
    # Shrouded : brume
    fog = ''.join(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="#cfd8e6" opacity="{o}"/>' for x, y, rx, ry, o in [(100, 190, 200, 28, .18), (420, 220, 260, 32, .16), (260, 260, 280, 36, .2), (560, 160, 160, 24, .14), (200, 130, 220, 22, .1)])
    write('sea-shrouded', W, H,
          f'<rect width="{W}" height="{H}" fill="url(#bg)"/>{stars(20, W, H, 4, .3, "#dfe8f5")}<path d="M520 250 l8 -90 l8 90z" fill="#26323f"/><circle cx="528" cy="156" r="22" fill="url(#lamp)"/><circle cx="528" cy="156" r="4" fill="#fff6c8"/>'
          f'{wave(250, "#25384a", 6)}{ship(250, 255, .75, "#aebccf", "#1b242e")}{fog}{wave(300, "#1b2a3a", 8, ph=-40, op=.9)}{fog}{wave(335, "#121d29", 9)}',
          BG('#16212e', '#4a5d73') + rg('lamp', [(0, '#fff6c8', .9), (1, '#fff6c8', 0)]))
    # Desolate : ruines
    write('sea-desolate', W, H,
          f'<rect width="{W}" height="{H}" fill="url(#bg)"/><circle cx="150" cy="110" r="38" fill="#e7b57b" opacity=".75"/>'
          '<path d="M380 250 v-90 h14 v30 h30 v-40 h12 v100z" fill="#3a2a22"/><path d="M450 250 q22 -70 56 0" fill="none" stroke="#3a2a22" stroke-width="14"/><path d="M520 250 v-60 h18 v60z" fill="#3a2a22"/>'
          '<path d="M250 255 l60 -86 l6 4 l-52 82z" fill="#2b1f1a"/><path d="M296 176 l56 -14 l-6 26z" fill="#a89580" opacity=".8"/>'
          f'{wave(250, "#59473c", 4, 640, 360, 0)}{wave(290, "#46372f", 5, ph=-30)}{wave(330, "#33271f", 6)}'
          '<path d="M90 252 l0 -40 m0 14 l16 -14 m-16 24 l-14 -10" stroke="#241912" stroke-width="4" fill="none" stroke-linecap="round"/>',
          BG('#3b2a26', '#c98b57'))
    # Sunken : sous l'eau
    rays = ''.join(f'<path d="M{x} 0 l{40} 360 h-70z" fill="#9fe7ff" opacity=".07"/>' for x in (80, 200, 330, 460, 560))
    r = random.Random(7)
    bubbles = ''.join(f'<circle cx="{r.uniform(20, 620):.0f}" cy="{r.uniform(30, 340):.0f}" r="{r.uniform(2, 7):.1f}" fill="none" stroke="#bff3ff" stroke-width="1.4" opacity=".6"/>' for _ in range(26))
    cols = ''.join(f'<rect x="{x}" y="{250 - h}" width="22" height="{h}" fill="#0b2a44"/><rect x="{x - 4}" y="{250 - h}" width="30" height="8" fill="#12456a"/>' for x, h in [(430, 90), (470, 60), (520, 110), (560, 70)])
    write('sea-sunken', W, H,
          f'<rect width="{W}" height="{H}" fill="url(#bg)"/>{rays}{cols}<rect y="300" width="{W}" height="60" fill="#06192b"/>'
          '<g transform="translate(180 170)"><ellipse rx="110" ry="46" fill="#04101d" opacity=".9"/><circle cx="-34" cy="-6" r="13" fill="#d9f6ff"/><circle cx="-34" cy="-6" r="6" fill="#04101d"/><circle cx="34" cy="-6" r="13" fill="#d9f6ff"/><circle cx="34" cy="-6" r="6" fill="#04101d"/></g>'
          f'{bubbles}',
          BG('#0d4f7a', '#041525'))
    # Molten : volcan
    embers = ''.join(f'<circle cx="{r.uniform(200, 460):.0f}" cy="{r.uniform(40, 200):.0f}" r="{r.uniform(1, 3):.1f}" fill="#ffb347" opacity=".8"/>' for _ in range(34))
    write('sea-molten', W, H,
          f'<rect width="{W}" height="{H}" fill="url(#bg)"/><circle cx="320" cy="120" r="110" fill="url(#glow)"/><path d="M130 280 L290 110 h60 L510 280z" fill="#1c0d0d"/><path d="M290 110 h60 l-8 18 l-14 -8 l-12 10 l-14 -10z" fill="#ff7a2a"/>'
          '<path d="M318 128 q-10 60 -34 100 q-14 22 -40 52 h46 q20 -50 28 -152z" fill="#ff5a1f" opacity=".85"/><path d="M336 130 q18 70 54 150 h-40 q-12 -60 -14 -150z" fill="#ff9a3c" opacity=".8"/>'
          f'{embers}{wave(280, "#3a0f0a", 5)}{wave(305, "#ff5a1f", 6, ph=-20, op=.55)}{wave(318, "#2a0a08", 7, ph=-45)}{ship(130, 292, .55, "#c8b8a8", "#120808")}',
          BG('#1a0707', '#7a1d0c') + rg('glow', [(0, '#ff8a3c', .85), (1, '#ff8a3c', 0)]))
    # Uncharted : carte inconnue
    rose = ''.join(f'<path d="M0 -70 L10 -10 L70 0 L10 10 L0 70 L-10 10 L-70 0 L-10 -10 Z" transform="rotate({a})" fill="#e8c994" opacity="{o}"/>' for a, o in [(0, .9), (45, .45)])
    write('sea-uncharted', W, H,
          f'<rect width="{W}" height="{H}" fill="url(#bg)"/>{stars(40, W, H, 9, 1, "#e8c994")}<g transform="translate(320 180)"><circle r="96" fill="none" stroke="#e8c994" stroke-width="1.5" stroke-dasharray="4 7" opacity=".6"/>{rose}</g>'
          '<path d="M40 300 C140 240 190 330 280 280 S420 150 600 90" fill="none" stroke="#8fe3d0" stroke-width="2.4" stroke-dasharray="3 9" stroke-linecap="round"/>'
          '<g fill="#e8c994" font-family="Georgia,serif" font-size="42" opacity=".8"><text x="70" y="120">?</text><text x="500" y="300">?</text><text x="560" y="150" font-size="28">?</text></g>',
          BG('#0a1630', '#1d2f55'))


# ------------------------------------------------------------------ PRISONS
def prisons():
    W, H = 640, 360
    write('prison-stocks', W, H,
          f'<rect width="{W}" height="{H}" fill="url(#bg)"/><circle cx="520" cy="90" r="30" fill="#ffe3b0" opacity=".85"/><rect y="270" width="{W}" height="90" fill="#3b2c22"/>'
          '<g fill="#2a1d15"><rect x="190" y="150" width="14" height="130"/><rect x="436" y="150" width="14" height="130"/></g><rect x="176" y="196" width="288" height="14" fill="#5a4030"/><rect x="176" y="222" width="288" height="14" fill="#4a3426"/>'
          '<circle cx="262" cy="216" r="16" fill="#1b130e"/><circle cx="378" cy="216" r="16" fill="#1b130e"/><circle cx="320" cy="190" r="22" fill="#e8c9a4"/><rect x="296" y="210" width="48" height="6" fill="#2a1d15"/>'
          '<g stroke="#111" stroke-width="7"><path d="M290 150 h60 M284 164 h72"/></g>'
          '<path d="M60 270 v-70 h50 v70 M70 200 l15 -30 l15 30" fill="#2a1d15" opacity=".8"/><path d="M520 270 v-90 h60 v90z" fill="#2a1d15" opacity=".7"/>',
          BG('#241a3a', '#c9724a'))
    bars = ''.join(f'<rect x="{x}" y="40" width="9" height="200" fill="#0b0e14"/>' for x in range(390, 570, 36))
    write('prison-cell', W, H,
          f'<rect width="{W}" height="{H}" fill="#12151c"/><rect x="380" y="40" width="200" height="200" fill="url(#moon)"/>{bars}<rect x="380" y="100" width="200" height="9" fill="#0b0e14"/><rect x="380" y="170" width="200" height="9" fill="#0b0e14"/>'
          '<path d="M0 270 h640 v90 h-640z" fill="#1c1f27"/><rect x="60" y="226" width="200" height="14" fill="#3a2f28"/><rect x="60" y="240" width="10" height="30" fill="#2a211c"/><rect x="250" y="240" width="10" height="30" fill="#2a211c"/><rect x="70" y="204" width="140" height="22" rx="8" fill="#5a4a60"/>'
          '<rect x="296" y="236" width="14" height="36" fill="#e8dcc8"/><path d="M303 236 q-14 -22 0 -40 q14 18 0 40z" fill="#ffb347"/><circle cx="303" cy="226" r="40" fill="url(#cand)"/>',
          rg('moon', [(0, '#cfe0ff', .55), (1, '#6e8fd0', .25)], .5, .3, .8) + rg('cand', [(0, '#ffb347', .45), (1, '#ffb347', 0)]))
    write('prison-camp', W, H,
          f'<rect width="{W}" height="{H}" fill="url(#bg)"/><rect y="250" width="{W}" height="110" fill="#caa66a"/>' + ''.join(f'<rect x="{x}" y="150" width="22" height="110" fill="#6b4a2e"/><path d="M{x} 150 l11 -16 l11 16z" fill="#6b4a2e"/>' for x in range(20, 620, 30)) +
          '<g transform="translate(300 300)"><path d="M0 -60 v70 M-26 -14 q26 44 52 0 M-14 -52 h28 M-8 -60 a8 8 0 1 0 .1 0" stroke="#2a2f3a" stroke-width="8" fill="none" stroke-linecap="round"/></g>'
          '<path d="M326 300 q40 10 60 -10 q20 -18 40 -4" fill="none" stroke="#2a2f3a" stroke-width="5" stroke-dasharray="9 5"/><g transform="translate(470 270)"><path d="M-34 6 l16 -30 l30 -6 l24 20 l-12 22z" fill="#6f6a66"/><path d="M-18 -24 l30 -6" stroke="#8a847e" stroke-width="3"/></g>'
          '<g transform="translate(560 250) rotate(-35)"><rect x="-3" y="-60" width="6" height="64" fill="#5a3b22"/><path d="M-26 -62 q26 -26 52 0 l-6 6 q-20 -14 -40 0z" fill="#9aa3b0"/></g>',
          BG('#2a6fb0', '#9ad7ff'))
    write('prison-platform', W, H,
          f'<rect width="{W}" height="{H}" fill="url(#bg)"/>' + ''.join(f'<ellipse cx="{x}" cy="{y}" rx="{r_}" ry="{r_ / 3.2}" fill="#fff" opacity=".7"/>' for x, y, r_ in [(110, 80, 60), (520, 60, 70), (420, 130, 40)]) +
          '<path d="M130 230 h380 q-30 70 -110 100 q-30 -20 -80 0 q-100 -20 -190 -100z" fill="#5a4636"/><path d="M130 230 q190 -34 380 0 v14 q-190 -30 -380 0z" fill="#4fa84a"/>'
          '<g fill="#0b1626"><rect x="230" y="150" width="16" height="70" rx="6"/><circle cx="238" cy="142" r="12"/><rect x="394" y="150" width="16" height="70" rx="6"/><circle cx="402" cy="142" r="12"/></g><g stroke="#ffd166" stroke-width="3"><path d="M210 160 l-12 -34 M426 160 l12 -34"/></g>'
          '<path d="M300 226 q20 -40 40 0" fill="none" stroke="#2a2f3a" stroke-width="6"/><rect x="296" y="222" width="48" height="10" fill="#6f6a66"/>',
          BG('#3f8fe0', '#bfe6ff'))
    lv = ''.join(f'<rect x="{240 + i * 4}" y="{60 + i * 38}" width="{160 - i * 8}" height="32" fill="#1b1727" stroke="#4a3d6a" stroke-width="2"/>'
                 + ''.join(f'<rect x="{262 + i * 4 + j * 28}" y="{70 + i * 38}" width="10" height="12" fill="{"#ff5d73" if i == 5 else "#ffd166"}" opacity=".9"/>' for j in range(4)) for i in range(6))
    write('prison-hades', W, H,
          f'<rect width="{W}" height="{H}" fill="url(#bg)"/>{stars(24, W, H, 5, .5, "#d9c8ff")}<circle cx="320" cy="300" r="170" fill="url(#aura)"/>{lv}'
          '<rect x="316" y="52" width="8" height="236" fill="#ff5d73" opacity=".35"/><path d="M0 290 q80 -20 160 0 t160 0 t160 0 t160 0 v70 h-640z" fill="#0b0716"/><path d="M0 320 q80 -16 160 0 t160 0 t160 0 t160 0 v40 h-640z" fill="#060410"/>',
          BG('#0a0618', '#2a1646') + rg('aura', [(0, '#ff5d73', .35), (1, '#ff5d73', 0)]))


# ------------------------------------------------------------------ FACTIONS
def factions():
    W, H = 640, 360
    skull = ('<circle cx="0" cy="-8" r="46" fill="#f4efe6"/><rect x="-26" y="26" width="52" height="26" rx="6" fill="#f4efe6"/><circle cx="-18" cy="-10" r="12" fill="#0b0e14"/><circle cx="18" cy="-10" r="12" fill="#0b0e14"/>'
             '<path d="M0 6 l-6 14 h12z" fill="#0b0e14"/><path d="M-12 36 v14 M0 36 v14 M12 36 v14" stroke="#0b0e14" stroke-width="3"/>'
             '<path d="M-96 -64 L96 90 M96 -64 L-96 90" stroke="#f4efe6" stroke-width="12" stroke-linecap="round"/>')
    write('faction-pirates', W, H, f'<rect width="{W}" height="{H}" fill="url(#bg)"/>{stars(18, W, H, 11, .5)}<rect x="318" y="30" width="5" height="300" fill="#5a3b22"/><path d="M323 40 h250 v200 h-250 q40 -22 0 -50 q40 -22 0 -50 q40 -22 0 -50z" fill="#0b0e14"/><g transform="translate(448 138) scale(.9)">{skull}</g>{wave(300, "#0b3a55", 9)}{wave(330, "#072a40", 10, ph=-30)}', BG('#0b1a2e', '#7a2a2a'))
    write('faction-marines', W, H, f'<rect width="{W}" height="{H}" fill="url(#bg)"/><circle cx="320" cy="170" r="130" fill="url(#h)"/><g transform="translate(320 170)" stroke="#f4f8ff" stroke-width="14" fill="none" stroke-linecap="round"><circle cy="-92" r="16"/><path d="M0 -76 v170 M-44 -30 h88 M-96 30 a96 96 0 0 0 192 0"/></g><path d="M60 250 q130 -90 200 -40 M580 250 q-130 -90 -200 -40" stroke="#f4f8ff" stroke-width="10" fill="none" opacity=".7" stroke-linecap="round"/>{wave(300, "#0c2f5c", 8)}{wave(332, "#08214a", 9, ph=-30)}', BG('#0a2a5e', '#4a8fd8') + rg('h', [(0, '#ffffff', .35), (1, '#ffffff', 0)]))
    write('faction-revolution', W, H, f'<rect width="{W}" height="{H}" fill="url(#bg)"/>{stars(16, W, H, 12, .5)}<circle cx="320" cy="190" r="140" fill="url(#h)"/><path d="M320 40 q60 70 20 120 q50 -10 52 70 q-6 80 -72 100 q-66 -20 -72 -100 q2 -80 52 -70 q-40 -50 20 -120z" fill="#ff7a2a"/><path d="M320 120 q30 40 8 76 q26 4 26 40 q-8 40 -34 50 q-26 -10 -34 -50 q0 -36 26 -40 q-22 -36 8 -76z" fill="#ffd166"/><path d="M120 330 q100 -60 200 -20 q100 -40 200 20z" fill="#2a0a0a"/>', BG('#1c0a0a', '#8a1d1d') + rg('h', [(0, '#ff7a2a', .35), (1, '#ff7a2a', 0)]))
    write('faction-government', W, H, f'<rect width="{W}" height="{H}" fill="url(#bg)"/>{stars(20, W, H, 13, .5, "#fff6c8")}<g fill="#e8e2d0"><rect x="150" y="150" width="340" height="150"/><rect x="130" y="290" width="380" height="24"/>' + ''.join(f'<rect x="{x}" y="100" width="30" height="190" fill="#f4efe6"/><rect x="{x - 6}" y="94" width="42" height="12" fill="#f4efe6"/>' for x in (170, 235, 300, 365, 430)) + '<path d="M130 100 L320 20 L510 100z"/></g><circle cx="320" cy="64" r="14" fill="#c9a14a"/><g fill="#0b1626" opacity=".35"><rect x="150" y="150" width="340" height="12"/></g>', BG('#0e1a3a', '#c9a14a'))
    write('faction-hunters', W, H, f'<rect width="{W}" height="{H}" fill="url(#bg)"/><rect x="60" y="50" width="200" height="260" rx="8" fill="#d9c49a" transform="rotate(-6 160 180)"/><g transform="rotate(-6 160 180)"><text x="160" y="96" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="30" fill="#4a2f16">WANTED</text><rect x="90" y="110" width="140" height="120" fill="#a68f66"/><circle cx="160" cy="160" r="26" fill="#6e5836"/><path d="M110 230 q50 -64 100 0z" fill="#6e5836"/><text x="160" y="268" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="#4a2f16">฿ ???</text></g><g transform="translate(450 180)" stroke="#ff5d73" stroke-width="5" fill="none"><circle r="84"/><circle r="40"/><path d="M0 -110 v50 M0 60 v50 M-110 0 h50 M60 0 h50"/><circle r="5" fill="#ff5d73"/></g>', BG('#1b1320', '#5a3a2a'))


# ------------------------------------------------------------------ RACES
def races():
    W = H = 320
    body = lambda sk, cl: f'<path d="M40 320 q10 -92 120 -96 q110 4 120 96z" fill="{cl}"/><rect x="138" y="190" width="44" height="40" fill="{sk}"/>'
    head = lambda sk, r=62, cy=140: f'<circle cx="160" cy="{cy}" r="{r}" fill="{sk}"/>'
    eyes = lambda c='#10131c', y=140, dx=24: f'<circle cx="{160 - dx}" cy="{y}" r="6" fill="{c}"/><circle cx="{160 + dx}" cy="{y}" r="6" fill="{c}"/>'
    smile = lambda y=170: f'<path d="M142 {y} q18 12 36 0" stroke="#10131c" stroke-width="4" fill="none" stroke-linecap="round"/>'
    hair = lambda c: f'<path d="M98 130 q4 -62 62 -66 q58 4 62 66 q-30 -34 -62 -34 q-32 0 -62 34z" fill="{c}"/>'
    frame = lambda a, b, cx='#fff', ck=.3: lg('bg', [(0, a), (1, b)]) + rg('g', [(0, cx, ck), (1, cx, 0)])
    base = lambda inner, a, b, cx='#fff': f'<rect width="{W}" height="{H}" fill="url(#bg)"/><circle cx="160" cy="150" r="140" fill="url(#g)"/>{inner}'
    write('race-human', W, H, base(body('#e8bf9a', '#3a5f9e') + head('#e8bf9a') + hair('#4a2e1c') + eyes() + smile(), 0, 0), frame('#14213d', '#3a5f9e', '#9fc4ff'))
    write('race-three-eyes', W, H, base(body('#d8b4e8', '#4a2a7a') + head('#d8b4e8') + hair('#1a1030') + eyes() + '<ellipse cx="160" cy="104" rx="13" ry="8" fill="#fff"/><circle cx="160" cy="104" r="5" fill="#b388ff"/><circle cx="160" cy="104" r="22" fill="url(#g2)"/>' + smile(), 0, 0), frame('#1a0f3a', '#6a3ab0', '#d9b8ff') + rg('g2', [(0, '#d9b8ff', .6), (1, '#d9b8ff', 0)]))
    write('race-avalonian', W, H, base('<path d="M40 190 q-30 -70 30 -120 q-10 70 46 100z M280 190 q30 -70 -30 -120 q10 70 -46 100z" fill="#fff6c8" opacity=".85"/>' + body('#f0d2b0', '#c9a14a') + head('#f0d2b0') + hair('#e8c46a') + eyes('#3a5fb0') + smile() + '<path d="M104 92 l14 -34 l22 22 l20 -34 l20 34 l22 -22 l14 34z" fill="#ffd166" stroke="#c9a14a" stroke-width="3"/>', 0, 0), frame('#2a2040', '#c9a14a', '#fff6c8'))
    write('race-lunarian', W, H, base('<circle cx="160" cy="120" r="108" fill="#f4efe6" opacity=".18"/><path d="M200 40 a100 100 0 1 0 0 200 a80 80 0 1 1 0 -200z" fill="#fff6c8" opacity=".5"/><path d="M60 230 q-40 -70 10 -130 q-4 60 56 90z M260 230 q40 -70 -10 -130 q4 60 -56 90z" fill="#ff7a2a"/><path d="M70 220 q-24 -50 6 -90 q0 44 36 70z M250 220 q24 -50 -6 -90 q0 44 -36 70z" fill="#ffd166"/>' + body('#c9b8e0', '#2a2a5a') + head('#c9b8e0') + hair('#f4efe6') + eyes('#ff7a2a') + smile(), 0, 0), frame('#0e1030', '#4a2a7a', '#fff6c8'))
    write('race-oni', W, H, base('<path d="M104 96 l-18 -60 l46 40z M216 96 l18 -60 l-46 40z" fill="#f4efe6"/>' + body('#d9534f', '#2a1a1a') + head('#d9534f') + '<path d="M108 120 q52 -34 104 0 q-20 -10 -52 -10 q-32 0 -52 10z" fill="#1a0f0f"/>' + eyes('#ffd166', 138, 26) + '<path d="M138 172 l6 -16 l6 16 M170 172 l6 -16 l6 16" stroke="#fff" stroke-width="5" fill="#fff"/><path d="M140 176 q20 10 40 0" stroke="#1a0f0f" stroke-width="5" fill="none"/>', 0, 0), frame('#1c0a0a', '#a02a2a', '#ff7a5a'))
    write('race-giant', W, H, '<rect width="320" height="320" fill="url(#bg)"/><circle cx="160" cy="150" r="140" fill="url(#g)"/><path d="M0 300 q80 -20 160 0 t160 0 v20 h-320z" fill="#10304a"/><path d="M60 320 q10 -120 100 -150 q90 30 100 150z" fill="#6a5a3a"/><circle cx="160" cy="110" r="64" fill="#d8b690"/><path d="M96 98 q10 -56 64 -58 q54 2 64 58 q-30 -20 -64 -20 q-34 0 -64 20z" fill="#7a3a1a"/><path d="M110 150 q50 56 100 0 q-6 56 -50 62 q-44 -6 -50 -62z" fill="#7a3a1a"/><circle cx="136" cy="112" r="7" fill="#10131c"/><circle cx="184" cy="112" r="7" fill="#10131c"/><g transform="translate(250 286) scale(.5)"><path d="M-34 0 L34 0 L26 14 L-26 14 Z" fill="#3a2a20"/><rect x="-1.5" y="-46" width="3" height="46" fill="#3a2a20"/><path d="M3 -44 Q30 -26 3 -6 Z" fill="#f4efe6"/></g>', frame('#10304a', '#6a5a3a', '#ffe0a0'))
    write('race-cyborg', W, H, base(body('#9aa8b8', '#2a3340') + head('#e0b896') + '<path d="M160 78 a62 62 0 0 1 0 124 z" fill="#8a98a8"/><rect x="164" y="124" width="52" height="22" rx="6" fill="#10131c"/><circle cx="196" cy="135" r="7" fill="#ff3b4a"/><circle cx="196" cy="135" r="16" fill="url(#g2)"/><circle cx="136" cy="140" r="6" fill="#10131c"/><path d="M118 98 q42 -34 84 0 q-10 -16 -42 -16 q-32 0 -42 16z" fill="#2a3340"/><g fill="#5a6a7a"><circle cx="210" cy="92" r="4"/><circle cx="214" cy="170" r="4"/></g><path d="M150 172 h40" stroke="#10131c" stroke-width="4"/>', 0, 0), frame('#0e1620', '#3a5a7a', '#8fe3ff') + rg('g2', [(0, '#ff3b4a', .7), (1, '#ff3b4a', 0)]))
    write('race-beastman', W, H, base('<path d="M96 120 l-6 -80 l52 50z M224 120 l6 -80 l-52 50z" fill="#e8a24a"/><path d="M104 104 l-2 -46 l32 32z M216 104 l2 -46 l-32 32z" fill="#f4c9a0"/>' + body('#e8a24a', '#5a3a1a') + head('#e8a24a') + '<ellipse cx="160" cy="166" rx="30" ry="22" fill="#f6dcb8"/><path d="M150 158 h20 l-10 10z" fill="#3a1a0a"/><path d="M60 160 h70 M62 176 h66 M190 160 h70 M192 176 h66" stroke="#fff" stroke-width="2" opacity=".7"/>' + eyes('#10131c', 134, 24) + '<path d="M240 300 q50 -20 40 -80 q-30 30 -60 50z" fill="#e8a24a"/>', 0, 0), frame('#2a1a0a', '#a0642a', '#ffd9a0'))
    bub = ''.join(f'<circle cx="{x}" cy="{y}" r="{r_}" fill="none" stroke="#bff3ff" stroke-width="2"/>' for x, y, r_ in [(250, 70, 14), (274, 110, 8), (236, 118, 6), (60, 90, 10)])
    write('race-marinian', W, H, base(bub + '<path d="M98 140 l-44 -22 l12 36 l-12 36 l44 -16z M222 140 l44 -22 l-12 36 l12 36 l-44 -16z" fill="#4cc9f0"/>' + body('#7fd6e8', '#0a4a7a') + head('#7fd6e8') + '<path d="M104 104 q56 -60 112 0 q-8 -18 -56 -20 q-48 2 -56 20z" fill="#0a6aa0"/>' + eyes('#10131c') + '<g stroke="#2a9ab8" stroke-width="3"><path d="M110 176 v14 M120 180 v14 M210 176 v14 M200 180 v14"/></g>' + smile(), 0, 0), frame('#062a4a', '#1a7ab0', '#9fe7ff'))
    write('race-dwarf', W, H, '<rect width="320" height="320" fill="url(#bg)"/><circle cx="160" cy="170" r="140" fill="url(#g)"/><path d="M30 320 q4 -70 130 -74 q126 4 130 74z" fill="#7a4a2a"/><circle cx="160" cy="176" r="66" fill="#e8bf9a"/><path d="M92 200 q68 110 136 0 q-10 70 -68 86 q-58 -16 -68 -86z" fill="#c9742a"/><path d="M96 150 q10 -76 64 -80 q54 4 64 80z" fill="#8a8f9a"/><rect x="96" y="132" width="128" height="14" fill="#6a6f7a"/><circle cx="136" cy="168" r="6" fill="#10131c"/><circle cx="184" cy="168" r="6" fill="#10131c"/><g transform="translate(262 230) rotate(24)"><rect x="-3" y="-60" width="6" height="90" fill="#5a3b22"/><rect x="-24" y="-74" width="48" height="26" rx="4" fill="#9aa3b0"/></g>', frame('#2a1a10', '#8a5a2a', '#ffd9a0'))


# ------------------------------------------------------------------ TRAITS (icônes 160)
def traits():
    def icon(name, a, b, inner):
        write('trait-' + name, 160, 160, f'<rect width="160" height="160" rx="36" fill="url(#bg)"/><circle cx="80" cy="80" r="64" fill="url(#g)"/>{inner}', lg('bg', [(0, a), (1, b)], 0, 0, 1, 1) + rg('g', [(0, '#fff', .25), (1, '#fff', 0)]))
    icon('health', '#3a0f1c', '#c9304a', '<path d="M80 124 C28 88 34 40 66 40 c10 0 18 6 14 16 c-4 -10 4 -16 14 -16 c32 0 38 48 -14 84z" fill="#ff5d73" stroke="#fff" stroke-width="3"/><path d="M40 82 h24 l8 -18 l14 36 l10 -18 h24" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>')
    icon('endurance', '#0c2a3a', '#1aa6a0', '<path d="M92 28 L50 88 h30 l-12 44 l46 -64 h-32z" fill="#ffe27a" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><g stroke="#bff3ff" stroke-width="4" stroke-linecap="round"><path d="M28 70 h22 M20 94 h30 M30 118 h20"/></g>')
    icon('defense', '#0e1a3a', '#3a6ad0', '<path d="M80 26 L130 44 v38 q0 36 -50 56 q-50 -20 -50 -56 v-38z" fill="#7fb2ff" stroke="#fff" stroke-width="4"/><path d="M80 26 v112 q-50 -20 -50 -56 v-38z" fill="#4a86e8"/><path d="M80 50 l8 18 l20 2 l-15 13 l5 20 l-18 -10 l-18 10 l5 -20 l-15 -13 l20 -2z" fill="#fff" opacity=".9"/>')
    icon('spiritual', '#1a0f3a', '#8a4ae0', '<circle cx="80" cy="80" r="36" fill="none" stroke="#d9b8ff" stroke-width="4" stroke-dasharray="6 6"/><path d="M26 80 q54 -56 108 0 q-54 56 -108 0z" fill="#fff" opacity=".92"/><circle cx="80" cy="80" r="20" fill="#8a4ae0"/><circle cx="80" cy="80" r="9" fill="#10131c"/><circle cx="86" cy="74" r="4" fill="#fff"/>')
    icon('will-power', '#3a1204', '#e8641a', '<path d="M80 20 q34 34 12 62 q26 -6 26 26 q-4 34 -38 40 q-34 -6 -38 -40 q0 -32 26 -26 q-22 -28 12 -62z" fill="#ffd166" stroke="#fff" stroke-width="3"/><path d="M80 78 q16 20 4 38 q-4 8 -4 8 q-14 -10 -10 -26 q4 -12 10 -20z" fill="#ff5a1f"/>')
    icon('luck', '#082a1a', '#22a85a', '<g fill="#7dffb0" stroke="#fff" stroke-width="3"><circle cx="64" cy="64" r="22"/><circle cx="96" cy="64" r="22"/><circle cx="64" cy="96" r="22"/><circle cx="96" cy="96" r="22"/></g><path d="M80 80 q8 26 30 44" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="80" cy="80" r="7" fill="#fff"/>')


# ------------------------------------------------------------------ ARMES (icônes 120)
def weapons():
    def icon(name, inner, c='#cfe0ff'):
        write('weapon-' + name, 120, 120, f'<circle cx="60" cy="60" r="54" fill="url(#g)"/><g stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="{c}" stroke-width="5">{inner}</g>', rg('g', [(0, '#5cc8ff', .28), (1, '#5cc8ff', 0)]))
    icon('sword', '<path d="M26 94 L86 34 l8 -8 l0 14 l-8 8z" fill="#cfe0ff"/><path d="M26 94 l-4 4 M36 78 l12 12 M30 90 l-8 8" stroke="#ffd166"/>')
    icon('katana', '<path d="M24 96 Q56 66 92 24 Q80 62 34 90z" fill="#cfe0ff"/><path d="M24 96 l-8 8 M34 84 l10 10" stroke="#ffd166"/>')
    icon('greatsword', '<path d="M18 102 L70 28 l22 -14 l-6 26 l-52 62z" fill="#cfe0ff"/><path d="M26 86 l22 20 M20 100 l-6 6" stroke="#ffd166"/>')
    icon('axe', '<path d="M34 100 L88 22" stroke="#c9a14a" stroke-width="6"/><path d="M62 28 q26 -16 42 8 q-18 28 -40 14z" fill="#cfe0ff"/>')
    icon('spear', '<path d="M24 100 L88 28" stroke="#c9a14a" stroke-width="5"/><path d="M84 18 l22 -4 l-6 22 l-12 -6z" fill="#cfe0ff"/>')
    icon('trident', '<path d="M28 102 L82 42" stroke="#c9a14a" stroke-width="5"/><path d="M64 36 q8 -22 36 -22 M72 46 l24 -26 M84 54 q22 -4 22 -34" stroke="#cfe0ff"/>')
    icon('gun', '<path d="M20 58 h56 l8 -10 h14 v22 h-18 l-8 18 h-14 l-6 -14 h-32z" fill="#cfe0ff" stroke="#10131c" stroke-width="2"/>')
    icon('cannon', '<rect x="20" y="42" width="66" height="26" rx="8" fill="#cfe0ff" stroke="#10131c" stroke-width="2"/><path d="M86 38 h14 v34 h-14" fill="#9aa3b0" stroke="#10131c" stroke-width="2"/><path d="M34 70 l-6 22 M60 70 l6 22"/>')
    icon('staff', '<path d="M26 100 L94 20" stroke="#c9a14a" stroke-width="7"/><circle cx="96" cy="18" r="9" fill="#cfe0ff"/>')
    icon('mace', '<path d="M28 100 L72 54" stroke="#c9a14a" stroke-width="6"/><circle cx="82" cy="42" r="20" fill="#cfe0ff" stroke="#10131c" stroke-width="2"/><path d="M82 18 v-8 M104 42 h8 M100 26 l6 -6 M100 58 l6 6 M64 26 l-6 -6" stroke="#cfe0ff"/>')
    icon('sickle', '<path d="M30 100 L60 62" stroke="#c9a14a" stroke-width="6"/><path d="M60 62 q-34 -16 -22 -42 q36 -4 56 22 q-20 -10 -34 20z" fill="#cfe0ff"/>')
    icon('chakram', '<circle cx="60" cy="60" r="34" stroke-width="9"/><circle cx="60" cy="60" r="12"/><path d="M60 22 v-8 M60 98 v8 M22 60 h-8 M98 60 h8" stroke="#ffd166"/>')
    icon('crossbow', '<path d="M16 60 q44 -52 88 0" stroke-width="6"/><path d="M60 24 v78 M60 102 l-8 -12 M60 102 l8 -12"/><path d="M60 26 l-8 14 h16z" fill="#ffd166"/>')
    icon('dagger', '<path d="M32 92 L82 38 l6 18 l-40 40z" fill="#cfe0ff"/><path d="M30 94 l-10 10" stroke="#ffd166"/>')
    icon('hook', '<path d="M30 100 L52 70" stroke="#ffd166" stroke-width="7"/><path d="M52 70 q-6 -34 26 -40 q22 4 16 24 q-6 -14 -22 -8 q-14 8 0 22" stroke="#cfe0ff" stroke-width="7"/>')
    icon('guitar', '<path d="M28 100 L70 52" stroke="#c9a14a" stroke-width="6"/><path d="M62 44 q24 -6 36 -26 l6 6 q-20 12 -26 36 q-14 12 -26 -2 q-6 -10 10 -14z" fill="#cfe0ff"/>')
    icon('cane', '<path d="M30 102 L80 44" stroke="#c9a14a" stroke-width="6"/><path d="M80 44 q-8 -30 22 -30 q22 4 14 26" stroke="#cfe0ff" stroke-width="7"/><circle cx="104" cy="16" r="5" fill="#ffd166"/>')
    icon('saw', '<path d="M22 70 L98 34 l4 30 L30 98z" fill="#cfe0ff" stroke="#10131c" stroke-width="2"/><path d="M26 82 l10 -2 l-2 8 l10 -4 l-2 8 l10 -4" stroke="#10131c" stroke-width="3"/>')
    icon('shield', '<path d="M60 14 L100 28 v30 q0 28 -40 46 q-40 -18 -40 -46 v-30z" fill="#4a86e8" stroke="#cfe0ff"/>')
    icon('blueprint', '<rect x="22" y="26" width="76" height="68" rx="6" fill="#0e3a6a" stroke="#8fe3ff" stroke-width="3"/><path d="M34 44 h52 M34 58 h30 M34 72 h44" stroke="#8fe3ff" stroke-width="3"/><circle cx="82" cy="76" r="10" stroke="#8fe3ff" stroke-width="3"/>')


# ------------------------------------------------------------------ MÉTIERS (icônes 120)
def jobs():
    def icon(name, a, b, inner):
        write('job-' + name, 120, 120, f'<rect width="120" height="120" rx="28" fill="url(#bg)"/><g stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="#fff" stroke-width="5">{inner}</g>', lg('bg', [(0, a), (1, b)], 0, 0, 1, 1))
    icon('peche', '#0b3a5a', '#1aa6c9', '<path d="M30 92 L82 22 q16 4 18 22"/><path d="M100 44 v34 q0 12 -10 12 q-8 0 -8 -8" /><path d="M24 98 q28 -22 30 -44 q-26 -4 -30 44z" fill="#ffd166" stroke="none"/>')
    icon('cuisine', '#4a1a08', '#e8641a', '<path d="M28 58 h64 q0 34 -32 34 q-32 0 -32 -34z"/><path d="M22 58 h76 M44 40 q-6 -12 6 -18 M64 36 q-6 -12 6 -18"/>')
    icon('artisanat', '#2a2f3a', '#6a7a8a', '<path d="M22 54 h64 q10 0 14 -10 v22 q-10 0 -24 8 v16 h-34 v-16 q-8 -8 -20 -8z" fill="#fff" fill-opacity=".15"/><path d="M96 38 l-18 -14 M82 18 l18 14"/>')
    icon('bois', '#1a3a12', '#4ea83a', '<path d="M32 98 L84 26" stroke="#ffd166" stroke-width="6"/><path d="M70 30 q26 -16 40 6 q-18 26 -38 12z" fill="#fff" fill-opacity=".85" stroke="none"/><rect x="18" y="86" width="34" height="14" rx="6" fill="#8a5a2a" stroke="none"/>')
    icon('minage', '#2a2030', '#7a5a8a', '<path d="M30 96 L84 34" stroke="#ffd166" stroke-width="6"/><path d="M52 34 q32 -22 56 14 q-34 -14 -56 -14z" fill="#fff" fill-opacity=".85" stroke="none"/><path d="M16 100 l14 -18 l16 18z" fill="#9aa3b0" stroke="none"/>')
    icon('navigation', '#0a2a4a', '#2a6ab0', '<circle cx="60" cy="60" r="22"/><circle cx="60" cy="60" r="6" fill="#fff"/><path d="M60 14 v22 M60 84 v22 M14 60 h22 M84 60 h22 M28 28 l14 14 M78 78 l14 14 M92 28 l-14 14 M42 78 l-14 14"/>')
    icon('vol', '#1a1020', '#5a3a6a', '<path d="M24 52 q36 -30 72 0 v14 q-36 22 -72 0z" fill="#fff" fill-opacity=".9" stroke="none"/><circle cx="46" cy="58" r="7" fill="#1a1020" stroke="none"/><circle cx="74" cy="58" r="7" fill="#1a1020" stroke="none"/><path d="M30 92 q30 14 60 0"/>')
    icon('medecin', '#3a0f1c', '#c9304a', '<rect x="22" y="22" width="76" height="76" rx="14"/><path d="M60 38 v44 M38 60 h44" stroke-width="9"/>')


# ------------------------------------------------------------------ APERÇUS ANIMÉS (clips 320x180)
CLIP_W, CLIP_H = 320, 180


def clip(name, a, b, body, style=''):
    write('fx-' + name, CLIP_W, CLIP_H,
          f'<rect width="{CLIP_W}" height="{CLIP_H}" fill="url(#bg)"/>{body}<rect width="{CLIP_W}" height="{CLIP_H}" fill="url(#vig)"/>',
          lg('bg', [(0, a), (1, b)]) + rg('vig', [(.6, '#000', 0), (1, '#000', .5)], .5, .5, .75),
          '.a{transform-box:fill-box;transform-origin:center}' + style)


def fx():
    r = random.Random(5)
    P = lambda n, f: ''.join(f(i) for i in range(n))
    # Logia
    clip('fire', '#1a0707', '#6a1a08', P(10, lambda i: f'<path class="a f" style="animation-delay:{i * .22:.2f}s" transform="translate({40 + i * 24} 150)" d="M0 0 q-16 -26 0 -50 q6 14 14 8 q8 20 -2 42z" fill="{["#ff5a1f", "#ff9a3c", "#ffd166"][i % 3]}"/>') + '<ellipse cx="160" cy="158" rx="150" ry="10" fill="#ff5a1f" opacity=".3"/>',
         '.f{animation:fl 1.6s ease-in infinite;opacity:0}@keyframes fl{0%{opacity:0;transform:translateY(0) scale(.6)}30%{opacity:1}100%{opacity:0;transform:translateY(-100px) scale(1.5)}}')
    clip('ice', '#0a2440', '#1a5a8a', P(14, lambda i: f'<path class="a s" style="animation-delay:{i * .25:.2f}s" transform="translate({r.randint(10, 300)} -10)" d="M0 -10 l6 10 l-6 12 l-6 -12z" fill="#bff3ff"/>') + '<path d="M40 180 l30 -80 l24 80z M110 180 l36 -110 l30 110z M190 180 l24 -70 l26 70z" fill="#9fe7ff" opacity=".7"/>',
         '.s{animation:sn 3s linear infinite}@keyframes sn{to{transform:translateY(200px) rotate(180deg)}}')
    clip('light', '#10102a', '#5a4a1a', '<circle class="a pu" cx="160" cy="90" r="30" fill="#fff6c8"/>' + P(12, lambda i: f'<path class="a ray" transform="rotate({i * 30} 160 90)" d="M160 90 L150 -40 h20z" fill="#fff6c8" opacity=".5"/>'),
         '.pu{animation:pu 1.4s ease-in-out infinite}@keyframes pu{50%{transform:scale(1.4)}}.ray{animation:rt 6s linear infinite;transform-origin:160px 90px}@keyframes rt{to{transform:rotate(360deg)}}')
    clip('lava', '#1a0707', '#7a1d0c', '<path d="M0 120 q40 -26 80 0 t80 0 t80 0 t80 0 v60 h-320z" fill="#ff5a1f" class="a wv"/><path d="M0 146 q40 -20 80 0 t80 0 t80 0 t80 0 v34 h-320z" fill="#c92a0a" class="a wv2"/>' + P(8, lambda i: f'<circle class="a bb" style="animation-delay:{i * .35:.2f}s" cx="{30 + i * 38}" cy="130" r="6" fill="#ffd166"/>'),
         '.wv{animation:wv 3s ease-in-out infinite alternate}.wv2{animation:wv 2.2s ease-in-out infinite alternate-reverse}@keyframes wv{to{transform:translateX(-40px)}}.bb{animation:bb 1.4s ease-out infinite;opacity:0}@keyframes bb{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-60px)}}')
    clip('lightning', '#0a0a1c', '#2a2a6a', '<path class="a bolt" d="M170 0 L120 80 h40 l-30 100 L220 70 h-44 L210 0z" fill="#fff6a0"/><path class="a bolt2" d="M60 0 L40 60 h20 l-12 60 L90 50 h-20 L84 0z" fill="#9fd8ff"/><path class="a bolt2" style="animation-delay:.6s" d="M270 0 L250 50 h18 l-10 70 L292 40 h-18 L286 0z" fill="#9fd8ff"/>',
         '.bolt{animation:bolt 1.2s steps(1) infinite}.bolt2{animation:bolt 1.2s steps(1) infinite .3s}@keyframes bolt{0%,40%{opacity:0}42%,50%{opacity:1}52%,60%{opacity:.2}62%,70%{opacity:1}72%,100%{opacity:0}}')
    clip('sand', '#3a2a10', '#c9964a', P(26, lambda i: f'<circle class="a sd" style="animation-delay:{i * .14:.2f}s" cx="160" cy="90" r="{r.uniform(1.5, 3.5):.1f}" fill="#f0d49a"/>') + '<path d="M0 160 q80 -26 160 0 t160 0 v20 h-320z" fill="#a8742a"/>',
         '.sd{animation:sd 3.4s linear infinite;transform-origin:160px 90px}@keyframes sd{0%{transform:rotate(0) translateX(10px) scale(.4);opacity:0}20%{opacity:1}100%{transform:rotate(540deg) translateX(100px) scale(1.2);opacity:0}}')
    clip('smoke', '#1a1a22', '#4a4a5a', P(9, lambda i: f'<circle class="a sm" style="animation-delay:{i * .5:.2f}s" cx="{80 + i * 20}" cy="170" r="22" fill="#cfd4dc"/>'),
         '.sm{animation:sm 4.5s ease-out infinite;opacity:0}@keyframes sm{0%{opacity:.7;transform:translateY(0) scale(.5)}100%{opacity:0;transform:translateY(-150px) scale(2.4)}}')
    clip('dark', '#04040a', '#2a1040', '<circle cx="160" cy="90" r="46" fill="#000"/><circle class="a pu" cx="160" cy="90" r="46" fill="none" stroke="#b388ff" stroke-width="3"/>' + P(18, lambda i: f'<circle class="a dk" style="animation-delay:{i * .2:.2f}s" cx="160" cy="90" r="2.5" fill="#b388ff"/>'),
         '.pu{animation:pu 2s ease-in-out infinite}@keyframes pu{50%{transform:scale(1.25);opacity:.3}}.dk{animation:dk 3.6s ease-in infinite;transform-origin:160px 90px}@keyframes dk{0%{transform:rotate(0) translateX(150px);opacity:0}20%{opacity:1}100%{transform:rotate(360deg) translateX(8px);opacity:0}}')
    # Paramecia
    clip('barrier', '#0a1a3a', '#1a4a8a', P(5, lambda i: f'<path class="a hx" style="animation-delay:{i * .3:.2f}s" transform="translate({60 + i * 50} {r.randint(50, 130)})" d="M0 -22 l19 11 v22 l-19 11 l-19 -11 v-22z" fill="#8fe3ff" fill-opacity=".25" stroke="#8fe3ff" stroke-width="2"/>'),
         '.hx{animation:hx 1.8s ease-in-out infinite}@keyframes hx{50%{transform:scale(1.15);opacity:.5}}')
    clip('bomb', '#1a0a0a', '#4a1a0a', '<circle class="a ex" cx="160" cy="95" r="14" fill="#ffd166"/><circle class="a ex" style="animation-delay:.25s" cx="160" cy="95" r="14" fill="none" stroke="#ff7a2a" stroke-width="6"/>',
         '.ex{animation:ex 1.6s ease-out infinite}@keyframes ex{0%{transform:scale(.3);opacity:1}100%{transform:scale(7);opacity:0}}')
    clip('blade', '#0a1020', '#1a2a4a', P(5, lambda i: f'<path class="a sl" style="animation-delay:{i * .22:.2f}s" d="M{30 + i * 40} 20 L{170 + i * 30} 160" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/>'),
         '.sl{stroke-dasharray:200;animation:sl 1.4s ease-out infinite}@keyframes sl{0%{stroke-dashoffset:200;opacity:1}60%{stroke-dashoffset:0;opacity:1}100%{opacity:0;stroke-dashoffset:0}}')
    clip('dough', '#2a1a08', '#8a5a2a', '<ellipse class="a bl" cx="160" cy="110" rx="70" ry="40" fill="#f6dcb0"/><ellipse class="a bl2" cx="120" cy="90" rx="30" ry="22" fill="#f6dcb0"/>',
         '.bl{animation:bl 2s ease-in-out infinite}.bl2{animation:bl 2s ease-in-out infinite reverse}@keyframes bl{50%{transform:scale(1.25,.75)}}')
    clip('gravity', '#10082a', '#2a1a5a', P(5, lambda i: f'<ellipse class="a gr" style="animation-delay:{i * .35:.2f}s" cx="160" cy="130" rx="90" ry="26" fill="none" stroke="#b388ff" stroke-width="3"/>') + P(10, lambda i: f'<rect class="a fa" style="animation-delay:{i * .2:.2f}s" x="{40 + i * 26}" y="0" width="10" height="10" fill="#8a7aa8"/>'),
         '.gr{animation:gr 2s linear infinite}@keyframes gr{0%{transform:scale(1.4);opacity:0}30%{opacity:1}100%{transform:scale(.2);opacity:0}}.fa{animation:fa 1.6s ease-in infinite}@keyframes fa{to{transform:translateY(150px)}}')
    clip('love', '#2a0a1a', '#8a1a4a', P(10, lambda i: f'<path class="a hr" style="animation-delay:{i * .3:.2f}s" transform="translate({30 + i * 28} 170)" d="M0 8 C-14 -4 -12 -16 0 -10 C12 -16 14 -4 0 8z" fill="{["#ff5d9a", "#ffb3d0", "#ff3b7a"][i % 3]}"/>'),
         '.hr{animation:hr 3s ease-in infinite;opacity:0}@keyframes hr{0%{opacity:0;transform:translateY(0) scale(.6)}20%{opacity:1}100%{opacity:0;transform:translateY(-170px) scale(2)}}')
    clip('room', '#06203a', '#0a6aa0', '<circle class="a rm" cx="160" cy="90" r="70" fill="#4cc9f0" fill-opacity=".14" stroke="#8fe3ff" stroke-width="2"/><ellipse cx="160" cy="90" rx="70" ry="22" fill="none" stroke="#8fe3ff" opacity=".6"/><ellipse cx="160" cy="90" rx="22" ry="70" fill="none" stroke="#8fe3ff" opacity=".6"/><path class="a sl2" d="M70 150 L250 30" stroke="#fff" stroke-width="3"/>',
         '.rm{animation:rm 2.4s ease-in-out infinite}@keyframes rm{0%{transform:scale(.2);opacity:0}30%{opacity:1}100%{transform:scale(1.1);opacity:1}}.sl2{stroke-dasharray:240;animation:sl2 2.4s ease-in-out infinite}@keyframes sl2{0%,50%{stroke-dashoffset:240}80%,100%{stroke-dashoffset:0}}')
    clip('paw', '#1a1208', '#5a3a1a', '<g class="a pw" fill="#e8a24a"><ellipse cx="160" cy="112" rx="34" ry="28"/><circle cx="116" cy="78" r="14"/><circle cx="148" cy="58" r="14"/><circle cx="182" cy="58" r="14"/><circle cx="212" cy="78" r="14"/></g>',
         '.pw{animation:pw 1.6s ease-in-out infinite}@keyframes pw{0%{transform:scale(.3);opacity:0}30%{transform:scale(1.1);opacity:1}45%{transform:scale(1)}80%{opacity:1}100%{opacity:0;transform:scale(1.2)}}')
    clip('quake', '#1a1208', '#4a3a2a', '<path d="M160 180 L150 130 L170 100 L156 70 L168 40" stroke="#ffd9a0" stroke-width="3" fill="none"/><path d="M160 180 L190 140 L200 110 M160 180 L120 150 L96 140" stroke="#ffd9a0" stroke-width="2" fill="none"/>' + P(3, lambda i: f'<ellipse class="a qk" style="animation-delay:{i * .5:.2f}s" cx="160" cy="178" rx="20" ry="6" fill="none" stroke="#fff" stroke-width="3"/>'),
         '.qk{animation:qk 1.6s ease-out infinite}@keyframes qk{0%{transform:scale(.3);opacity:1}100%{transform:scale(14);opacity:0}}')
    clip('revive', '#082a1a', '#1a8a5a', '<circle class="a rv" cx="160" cy="100" r="50" fill="none" stroke="#7dffb0" stroke-width="3"/>' + P(14, lambda i: f'<path class="a sp" style="animation-delay:{i * .2:.2f}s" transform="translate({60 + i * 15} 170)" d="M0 -6 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2z" fill="#d6ffe6"/>'),
         '.rv{animation:rv 2.4s ease-in-out infinite}@keyframes rv{50%{transform:scale(1.2);opacity:.4}}.sp{animation:sp 2.8s ease-in infinite;opacity:0}@keyframes sp{20%{opacity:1}100%{opacity:0;transform:translateY(-140px)}}')
    clip('rubber', '#2a0a0a', '#8a2a1a', '<g class="a rb"><path d="M30 140 Q160 20 270 130" stroke="#e8a24a" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="270" cy="130" r="22" fill="#e8a24a"/></g><circle cx="30" cy="140" r="18" fill="#e8a24a"/>',
         '.rb{animation:rb 1.4s cubic-bezier(.6,-.4,.3,1.4) infinite;transform-origin:30px 140px}@keyframes rb{0%{transform:scaleX(.15)}50%{transform:scaleX(1.05)}100%{transform:scaleX(.15)}}')
    clip('soul', '#08122a', '#1a2a6a', P(8, lambda i: f'<path class="a ws" style="animation-delay:{i * .4:.2f}s" transform="translate({40 + i * 34} 170)" d="M0 0 q-12 -16 0 -30 q12 -14 0 -30 q-8 -12 6 -22 q10 14 2 26 q-8 14 2 30 q8 16 -10 26z" fill="#bfe0ff" opacity=".8"/>'),
         '.ws{animation:ws 3.4s ease-out infinite;opacity:0}@keyframes ws{0%{opacity:0;transform:translateY(0)}30%{opacity:.9}100%{opacity:0;transform:translateY(-130px)}}')
    clip('string', '#10101a', '#3a3a5a', P(9, lambda i: f'<path class="a st" style="animation-delay:{i * .15:.2f}s" d="M{20 + i * 36} 0 Q{80 + i * 20} 90 {160 + (i - 4) * 30} 180" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8"/>'),
         '.st{stroke-dasharray:240;animation:st 2.2s ease-in-out infinite}@keyframes st{0%{stroke-dashoffset:240}60%,100%{stroke-dashoffset:0}}')
    clip('venom', '#1a0a2a', '#4a1a6a', P(8, lambda i: f'<path class="a vd" style="animation-delay:{i * .35:.2f}s" transform="translate({40 + i * 34} 20)" d="M0 -8 q8 12 0 18 q-8 -6 0 -18z" fill="#b8ff3b"/>') + '<path d="M0 160 q80 -20 160 0 t160 0 v20 h-320z" fill="#7acc1a" opacity=".6"/>',
         '.vd{animation:vd 1.8s ease-in infinite}@keyframes vd{0%{transform:translateY(0);opacity:1}80%{opacity:1}100%{transform:translateY(130px);opacity:0}}')
    # Zoan, Zoan mythique
    clip('claw', '#0a1a0a', '#2a4a1a', '<circle cx="110" cy="40" r="5" fill="#ffd166"/><circle cx="140" cy="40" r="5" fill="#ffd166"/>' + P(3, lambda i: f'<path class="a cl" style="animation-delay:{i * .12:.2f}s" d="M{70 + i * 34} 20 Q{120 + i * 34} 90 {190 + i * 34} 170" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/>') + '<circle class="a rg" cx="160" cy="90" r="30" fill="none" stroke="#9aff6a" stroke-width="3"/>',
         '.cl{stroke-dasharray:220;animation:cl 1.6s ease-out infinite}@keyframes cl{0%{stroke-dashoffset:220;opacity:1}40%{stroke-dashoffset:0;opacity:1}100%{opacity:0;stroke-dashoffset:0}}.rg{animation:rgx 1.6s ease-out infinite}@keyframes rgx{0%{transform:scale(.3);opacity:1}100%{transform:scale(5);opacity:0}}')
    clip('aura', '#1a0a3a', '#6a2a8a', '<circle class="a au" cx="160" cy="95" r="60" fill="url(#ag)"/><path class="a wing" d="M160 100 q-100 -90 -140 -20 q50 -10 70 30 q-34 4 -50 36 q50 -20 120 -46z" fill="#ffd9a0" opacity=".85"/><path class="a wing2" d="M160 100 q100 -90 140 -20 q-50 -10 -70 30 q34 4 50 36 q-50 -20 -120 -46z" fill="#ffd9a0" opacity=".85"/><circle cx="160" cy="96" r="14" fill="#fff"/>',
         '.au{animation:au 2.2s ease-in-out infinite}@keyframes au{50%{transform:scale(1.3);opacity:.5}}.wing{animation:wg 1.8s ease-in-out infinite;transform-origin:160px 100px}.wing2{animation:wg2 1.8s ease-in-out infinite;transform-origin:160px 100px}@keyframes wg{50%{transform:rotate(-12deg)}}@keyframes wg2{50%{transform:rotate(12deg)}}')
    # Haki
    clip('haki-armement', '#0a0a14', '#2a1a4a', '<path d="M40 130 q60 -60 150 -30 l70 -16 v44 l-70 16 q-90 20 -150 -14z" fill="#1a1022"/><path class="a sh" d="M40 130 q60 -60 150 -30 l70 -16" fill="none" stroke="#b388ff" stroke-width="6" stroke-linecap="round"/><path class="a sh2" d="M60 142 q90 -20 190 -18" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>',
         '.sh{stroke-dasharray:60 240;animation:sh 2s linear infinite}@keyframes sh{to{stroke-dashoffset:-300}}.sh2{stroke-dasharray:30 260;animation:sh 1.6s linear infinite .4s}')
    clip('haki-observation', '#06203a', '#0a4a7a', '<ellipse cx="160" cy="90" rx="86" ry="42" fill="none" stroke="#8fe3ff" stroke-width="3"/><circle cx="160" cy="90" r="22" fill="#4cc9f0"/><circle cx="160" cy="90" r="9" fill="#04101c"/>' + P(3, lambda i: f'<circle class="a rp" style="animation-delay:{i * .6:.2f}s" cx="160" cy="90" r="20" fill="none" stroke="#8fe3ff" stroke-width="2"/>'),
         '.rp{animation:rp 2.4s ease-out infinite}@keyframes rp{0%{transform:scale(.5);opacity:1}100%{transform:scale(5);opacity:0}}')
    clip('haki-rois', '#1a0404', '#5a0a0a', '<circle class="a rr" cx="160" cy="95" r="20" fill="#ff3b4a"/>' + P(4, lambda i: f'<path class="a bt" style="animation-delay:{i * .18:.2f}s" d="M160 95 l{[-90, 90, -60, 70][i]} {[-70, -60, 70, 60][i]} l-14 {[14, 12, -12, -10][i]} l{[-40, 50, -30, 36][i]} {[-30, -26, 34, 30][i]}" stroke="#ff9aa2" stroke-width="3" fill="none"/>'),
         '.rr{animation:rr 1.4s ease-in-out infinite}@keyframes rr{50%{transform:scale(1.7);opacity:.4}}.bt{animation:bt 1.4s steps(1) infinite}@keyframes bt{0%,45%{opacity:0}50%,60%{opacity:1}65%,75%{opacity:.2}80%,100%{opacity:0}}')
    clip('haki-agile', '#042a2a', '#0a6a6a', P(9, lambda i: f'<rect class="a sp2" style="animation-delay:{i * .12:.2f}s" x="0" y="{20 + i * 17}" width="{r.randint(60, 140)}" height="3" rx="1.5" fill="#bff3ff"/>') + '<circle cx="250" cy="90" r="10" fill="#fff"/>',
         '.sp2{animation:sp2 1s linear infinite}@keyframes sp2{from{transform:translateX(-160px)}to{transform:translateX(340px)}}')
    clip('haki-fierce', '#2a0a04', '#8a2a0a', '<path class="a bu" d="M160 90 l14 -50 l12 44 l44 -22 l-22 42 l48 6 l-48 16 l24 42 l-44 -20 l-8 46 l-22 -42 l-40 30 l14 -46 l-48 0 l44 -22 l-34 -38 l46 18z" fill="#ffd166" stroke="#ff5a1f" stroke-width="3"/>',
         '.bu{animation:bu 1s ease-out infinite}@keyframes bu{0%{transform:scale(.2);opacity:1}60%{transform:scale(1);opacity:1}100%{transform:scale(1.3);opacity:0}}')
    clip('haki-tactic', '#0a1a2a', '#1a3a5a', P(6, lambda i: f'<line x1="{40 + i * 48}" y1="10" x2="{40 + i * 48}" y2="170" stroke="#8fe3ff" opacity=".35"/>') + P(4, lambda i: f'<line x1="10" y1="{30 + i * 40}" x2="310" y2="{30 + i * 40}" stroke="#8fe3ff" opacity=".35"/>') + '<circle class="a tg" cx="160" cy="90" r="20" fill="none" stroke="#ffd166" stroke-width="3"/><path class="a tg2" d="M160 70 l8 16 l18 2 l-13 12 l4 18 l-17 -9 l-17 9 l4 -18 l-13 -12 l18 -2z" fill="#ffd166"/>',
         '.tg{animation:tg 1.6s ease-in-out infinite}@keyframes tg{50%{transform:scale(1.6);opacity:.3}}.tg2{animation:tg 1.6s ease-in-out infinite reverse}')


if __name__ == '__main__':
    seas(); prisons(); factions(); races(); traits(); weapons(); jobs(); fx()
    print(len(os.listdir(OUT)), 'fichiers dans', os.path.abspath(OUT))
