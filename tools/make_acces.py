#!/usr/bin/env python3
"""Génère dist/acces.html (accès, rangs Silver/Gold, perks) à partir du squelette de factions.html.
Tout le contenu vient de textes déjà présents sur le site (index, factions, métiers, codex)."""
import os, re

D = os.path.join(os.path.dirname(__file__), '..', 'dist')
src = open(os.path.join(D, 'factions.html'), encoding='utf-8').read()
head = src[:src.index('<body>')]
head = re.sub(r'<title>.*?</title>', '<title>Accès et perks · RELL Seas Atlas</title>', head, count=1, flags=re.S)
head = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="Accès à RELL Seas : EAC, MMORPG, rangs Silver et Gold, perks connus et paliers d’équipement.">', head, count=1)
head = re.sub(r'(<nav aria-label="Navigation principale">).*?(</nav>)', r'\1\2', head, flags=re.S)
foot = src[src.index('</main>'):]

QA = 'https://rellseaswiki.com/early-access-community/'
DISCORD = 'https://discord.com/servers/rell-games-562762757905186828'


def card(title, tag, body, art=None, link=None):
    img = f'<div class="dcard-art"><img src="visuals/art/{art}.svg" alt="" loading="lazy"></div>' if art else ''
    more = f'<p><a href="{link[0]}">{link[1]}</a></p>' if link else ''
    cls = ' has-art' if art else ''
    return f'<article class="dcard{cls}">{img}<header><h3>{title}</h3></header><span class="en">{tag}</span>{body}{more}</article>'


main = f'''<main id="main"><div class="codex-hero"><div class="wrap"><p class="label">ACCÈS</p><h1>Accès et perks</h1>
<p>Où et comment jouer, ce que disent les sources sur les rangs Silver et Gold, les perks connus et la différence entre un rang d’abonnement et un palier d’équipement. Compilé à partir des textes déjà présents sur le site.</p>
<nav class="codex-nav" aria-label="Sommaire"><a href="#environnements">Environnements</a><a href="#rangs">Silver et Gold</a><a href="#perks">Perks</a><a href="#paliers">Paliers d’équipement</a><a href="#verifier">À vérifier</a></nav></div></div>

<section class="wrap section codex-section" id="environnements"><p class="label">ENVIRONNEMENTS</p><h2>Où jouer : EAC, MMORPG, PAC</h2>
<p class="muted lead">Le récapitulatif du Q&amp;A de septembre décrit deux environnements dans le même projet. Les modalités d’ouverture peuvent évoluer.</p>
<div class="card-grid">
{card('EAC', 'Early Access Community', '<p>Environnement distinct prévu pour les essais à grande échelle. Le récapitulatif évoque un plafond de détention de fruits et des Marines qui traquent leurs détenteurs selon la « Doctrine of Power ».</p>', 'sea-uncharted', (QA, 'Récapitulatif du Q&A EAC'))}
{card('MMORPG', 'Expérience principale', '<p>L’expérience destinée au public. Les fruits y sont décrits comme rares, sans le plafond de détention ni la traque spécifique présentés pour l’EAC.</p>', 'sea-forestis')}
{card('PAC', 'Passage envisagé', '<p>Des récapitulatifs de joueurs décrivent une ouverture par vagues, une progression distincte et un passage envisagé de l’EAC à la PAC. Rien d’officiel.</p>', 'sea-motley')}
</div></section>

<section class="wrap section codex-section" id="rangs"><p class="label">RANGS</p><h2>Silver et Gold : ce qui est rapporté</h2>
<p class="muted lead">Le Q&amp;A cite les rangs Silver+ et Gold+ pour les tests EAC. Une ancienne capture des avantages indique que Gold reprend ceux de Silver.</p>
<div class="table-wrap"><table class="data"><caption>Rangs d’abonnement</caption><thead><tr><th>Rang</th><th>Ce que disent les sources</th><th>Certitude</th></tr></thead><tbody>
<tr><td>Silver+</td><td>Cité pour les tests EAC. Les avantages Silver incluraient l’accès CC · Seas (ancienne capture).</td><td><span class="badge old">Ancienne capture</span></td></tr>
<tr><td>Gold+</td><td>Cité pour les tests EAC. Reprend les avantages Silver, dont l’accès CC · Seas.</td><td><span class="badge old">Ancienne capture</span></td></tr>
<tr><td>Durée des droits</td><td>Ce qui se passe après expiration et la prise en compte d’un ancien abonnement ne sont pas documentés.</td><td><span class="badge unk">Inconnu</span></td></tr>
<tr><td>Anciens abonnés sans rôle</td><td>Le récapitulatif conseille d’ouvrir un ticket d’abonnement.</td><td><span class="badge hypo">Conseil rapporté</span></td></tr>
</tbody></table></div>
<p class="callout"><strong>Un mois de Gold suffit-il ?</strong> Non vérifié. Les conditions au moment de l’ouverture restent à confirmer dans le <a href="{DISCORD}">Discord RELL Games</a>. Les conditions actuelles de Gold et Silver dépendent des annonces du serveur.</p>
<p class="source-line"><a href="{QA}">Récapitulatif du Q&amp;A EAC</a> · <a href="{DISCORD}">Discord RELL Games</a></p></section>

<section class="wrap section codex-section" id="perks"><p class="label">PERKS</p><h2>Les perks connus</h2>
<p class="muted lead">Quatre sources de perks apparaissent dans les sources du site. Aucune valeur chiffrée n’est confirmée.</p>
<div class="card-grid">
{card('Perks de crew', 'Journal · onglet Familiar', '<p>L’onglet Familiar du journal liste les crews avec leurs perks. Les 40 crews PNJ sont recensés dans le dossier des factions.</p>', 'faction-pirates', ('factions.html#pirates', 'Voir les crews'))}
{card('Perks de rang Marine', '21 rangs', '<p>Les rangs montent via la réputation et les missions. L’Admiral accède à tout Hades Asylum par l’ascenseur, et l’appel d’un Buster Call est réservé au sommet.</p>', 'faction-marines', ('factions.html#marines', 'Voir les rangs'))}
{card('Weapon bond', 'Création de personnage', '<p>Selon les guides communautaires, le personnage choisirait une affinité avec une classe d’arme qui donnerait un bonus d’expérience d’arme. Un bonus d’EXP n’est pas une hausse de dégâts.</p>', 'prison-camp', ('codex.html#armes', 'Voir les armes'))}
{card('Titres et noms', 'Relevé Reddit', '<p>Les traits viennent du Randomize ou d’une quête. Les bonus rapportés touchent les royaumes, l’XP et certaines classes d’armes. À vérifier.</p>', 'sea-shrouded', ('codex.html#carte', 'Voir noms et initiales'))}
</div></section>

<section class="wrap section codex-section" id="paliers"><p class="label">PALIERS</p><h2>Bronze, Silver, Gold : à ne pas confondre</h2>
<p class="callout"><strong>Attention :</strong> « Gold » désigne ici un <strong>palier d’équipement</strong> (outils, serrures, boussole), sans rapport avec le rang d’abonnement Gold de l’accès anticipé.</p>
<div class="table-wrap"><table class="data"><caption>Paliers d’équipement</caption><thead><tr><th>Équipement</th><th>Paliers</th><th>Métier</th></tr></thead><tbody>
<tr><td>Pioche</td><td>Bronze, Silver, Gold, Leviathan</td><td>Minage</td></tr>
<tr><td>Hache</td><td>Bronze, Silver, Gold, Leviathan</td><td>Bûcheronnage</td></tr>
<tr><td>Pelle</td><td>Bronze, Silver, Gold, Leviathan, Stormstone, Summonance</td><td>Navigation</td></tr>
<tr><td>Boussole</td><td>Bronze, Silver, Gold</td><td>Navigation</td></tr>
<tr><td>Marteaux</td><td>Bronze, Silver, Gold, Leviathan, Stormstone Hammer</td><td>Artisanat</td></tr>
<tr><td>Serrures</td><td>Bronze, Silver, Gold, Leviathan</td><td>Vol</td></tr>
<tr><td>Crochets</td><td>Bronze, Silver, Gold, SeaStone, Sapphire, RubyGold</td><td>Vol</td></tr>
</tbody></table></div>
<p class="source-line"><a href="metiers.html">Voir les huit métiers</a></p></section>

<section class="wrap section codex-section" id="verifier"><p class="label">À VÉRIFIER</p><h2>Ce qui reste inconnu</h2>
<div class="entry-grid">
<details class="entry"><summary>Date et ouverture<small>Non confirmé</small></summary><p>Aucune date officielle de sortie. Les modalités d’ouverture de l’EAC et de la PAC peuvent changer.</p></details>
<details class="entry"><summary>Valeur des avantages Gold<small>Inconnu</small></summary><p>Les captures d’avantages sont anciennes. Aucune durée ni condition de renouvellement n’est confirmée.</p></details>
<details class="entry"><summary>Plafond de détention des fruits<small>Rapporté</small></summary><p>Le chiffre du plafond en EAC n’est pas donné dans les sources consultées.</p></details>
<details class="entry"><summary>Perks de crew<small>À documenter</small></summary><p>Le journal liste des perks, mais le contenu complet de chaque crew reste à relever en jeu.</p></details>
</div></section>
'''

out = head + '<body>\n<div class="night-sky" aria-hidden="true"><i></i><i></i><i></i></div><a class="skip" href="#main">Aller au contenu</a>\n<header class="top"><div class="wrap bar"><a class="brand" href="index.html"><span class="compass" aria-hidden="true"></span> RELL SEAS <small>ATLAS</small></a><nav aria-label="Navigation principale"></nav></div></header>\n' + main + foot
open(os.path.join(D, 'acces.html'), 'w', encoding='utf-8').write(out)
print('acces.html', len(out))
