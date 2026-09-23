// EN: Generate the TextMate grammar for .pls from the plscripten dictionary, so
// editor syntax highlighting always tracks the lexicon. The Polish words are
// pulled straight from dist/dictionary.js and bucketed into TextMate scopes;
// the result is written to editor/vscode-plscripten/syntaxes. Run after build:
// `node tools/gen-grammar.ts`. Node 24+ native TypeScript.
// PL: Generuje gramatykę TextMate dla .pls ze słownika plscripten, aby
// podświetlanie składni w edytorze zawsze podążało za leksykonem. Polskie słowa
// pobierane są wprost z dist/dictionary.js i przydzielane do zakresów TextMate;
// wynik trafia do editor/vscode-plscripten/syntaxes. Uruchom po budowaniu:
// `node tools/gen-grammar.ts`. Natywny TypeScript Node 24+.
const fs = require('node:fs') as typeof import('node:fs');
const path = require('node:path') as typeof import('node:path');

const root: string = path.join(__dirname, '..');
const dist: string = path.join(root, 'dist');
const { LEXICON, ENGLISH_TO_POLISH } = require(path.join(dist, 'dictionary.js')) as typeof import('../src/dictionary');

// EN: A Unicode-aware identifier boundary. Polish source uses letters like ł, ś,
// ę, so ASCII \b is not enough — we assert the neighbouring char is not part of
// an identifier.
// PL: Granica identyfikatora świadoma Unicode. Kod polski używa liter jak ł, ś,
// ę, więc ASCII \b nie wystarczy — sprawdzamy, że sąsiedni znak nie należy do
// identyfikatora.
const IDENT_CHAR = '[\\p{L}\\p{N}_$]';
const BEFORE = `(?<!${IDENT_CHAR})`;
const AFTER = `(?!${IDENT_CHAR})`;

// EN: Which English tokens belong to which scope. Anything not listed falls back
// to its lexicon group's default scope, so new dictionary entries still colour.
// PL: Które angielskie tokeny należą do którego zakresu. Cokolwiek spoza list
// wraca do domyślnego zakresu swojej grupy, więc nowe wpisy nadal się kolorują.
const CONTROL = new Set(['if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'throw', 'try', 'catch', 'finally', 'yield', 'await', 'debugger']);
const STORAGE_TYPE = new Set(['var', 'let', 'const', 'function', 'class', 'interface', 'type', 'enum', 'namespace', 'module', 'declare']);
const MODIFIER = new Set(['abstract', 'readonly', 'public', 'private', 'protected', 'static', 'get', 'set', 'override', 'accessor', 'async', 'export', 'import']);
const OPERATOR = new Set(['new', 'delete', 'typeof', 'instanceof', 'in', 'of', 'void', 'keyof', 'infer', 'is', 'satisfies', 'asserts', 'unique', 'as', 'extends', 'implements']);
const MODULE_KW = new Set(['from', 'require', 'exports', 'with']);
const LANG_CONST = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity']);
const LANG_VAR = new Set(['this', 'super', 'globalThis', '__dirname', '__filename', 'console', 'process', 'Buffer']);

// EN: Map an English token (and its lexicon group) to a TextMate scope.
// PL: Odwzorowuje angielski token (i jego grupę leksykonu) na zakres TextMate.
function scopeFor(english: string, groupTitle: string): string {
	if(LANG_CONST.has(english)) return 'constant.language.pls';
	if(LANG_VAR.has(english)) return 'variable.language.pls';
	if(STORAGE_TYPE.has(english)) return 'storage.type.pls';
	if(MODIFIER.has(english)) return 'storage.modifier.pls';
	if(OPERATOR.has(english)) return 'keyword.operator.expression.pls';
	if(CONTROL.has(english)) return 'keyword.control.pls';
	if(MODULE_KW.has(english)) return 'keyword.control.import.pls';

	if(groupTitle.includes('Typy proste')) return 'support.type.primitive.pls';
	if(groupTitle.includes('Typy narzędziowe')) return 'support.type.pls';
	if(groupTitle.includes('Obiekty globalne')) return 'support.class.pls';
	if(groupTitle.includes('Funkcje globalne')) return 'support.function.pls';

	return 'keyword.other.pls';
}

// EN: Escape regex metacharacters (dictionary words are letters, but be safe).
// PL: Ekranuje metaznaki regex (słowa słownika to litery, ale na wszelki wypadek).
function escapeRegex(word: string): string {
	return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// EN: Build a longest-first alternation so multi-part words win over prefixes.
// PL: Buduje alternatywę od najdłuższych, by słowa wieloczłonowe wygrywały z prefiksami.
function alternation(words: readonly string[]): string {
	return words
		.slice()
		.sort((a, b) => b.length - a.length || a.localeCompare(b))
		.map(escapeRegex)
		.join('|');
}

// EN: Collect Polish words per scope for standalone (non-member) tokens, and the
// full member list separately (matched only after a dot).
// PL: Zbiera polskie słowa według zakresu dla tokenów samodzielnych oraz osobno
// pełną listę składowych (dopasowywanych tylko po kropce).
const byScope = new Map<string, string[]>();
const members: string[] = [];

for(const group of LEXICON) {
	const isMembers = group.title.includes('Metody i pola');

	for(const english of Object.keys(group.entries)) {
		const polish = group.entries[english];

		if(isMembers) {
			members.push(polish);
			continue;
		}

		const scope = scopeFor(english, group.title);
		const bucket = byScope.get(scope) ?? [];
		bucket.push(polish);
		byScope.set(scope, bucket);
	}
}

// EN: Specific Polish declaration keywords we anchor name-capturing rules to.
// PL: Konkretne polskie słowa deklaracji, do których kotwiczymy reguły nazw.
const pl = (english: string): string => {
	const word = ENGLISH_TO_POLISH.get(english);

	if(word === undefined) throw new Error(`Missing dictionary entry: ${english}`);

	return escapeRegex(word);
};

const FUNCTION_KW = pl('function');
const CLASS_KW = pl('class');
const INTERFACE_KW = pl('interface');
const ENUM_KW = pl('enum');
const TYPE_KW = pl('type');
const NAMESPACE_KW = pl('namespace');

// EN: Assemble the grammar. Patterns are ordered so comments/strings and keyword
// rules win before the generic function-call rule.
// PL: Składamy gramatykę. Kolejność wzorców zapewnia, że komentarze/napisy oraz
// reguły słów kluczowych wygrywają przed ogólną regułą wywołania funkcji.
type Pattern = Record<string, unknown>;
const patterns: Pattern[] = [];

// Comments
patterns.push(
	{
		name: 'comment.line.double-slash.pls',
		begin: '//',
		end: '$',
	},
	{
		name: 'comment.block.pls',
		begin: '/\\*',
		end: '\\*/',
	},
);

// Strings
patterns.push(
	{
		name: 'string.quoted.double.pls',
		begin: '"',
		end: '"',
		patterns: [{ name: 'constant.character.escape.pls', match: '\\\\.' }],
	},
	{
		name: 'string.quoted.single.pls',
		begin: "'",
		end: "'",
		patterns: [{ name: 'constant.character.escape.pls', match: '\\\\.' }],
	},
	{
		name: 'string.template.pls',
		begin: '`',
		end: '`',
		patterns: [
			{ name: 'constant.character.escape.pls', match: '\\\\.' },
			{
				name: 'meta.template.expression.pls',
				begin: '\\$\\{',
				end: '\\}',
				beginCaptures: { 0: { name: 'punctuation.definition.template-expression.begin.pls' } },
				endCaptures: { 0: { name: 'punctuation.definition.template-expression.end.pls' } },
				patterns: [{ include: '$self' }],
			},
		],
	},
);

// Declarations that capture the following name
patterns.push(
	{
		match: `${BEFORE}(${FUNCTION_KW})${AFTER}\\s+([\\p{L}_$][\\p{L}\\p{N}_$]*)`,
		captures: {
			1: { name: 'storage.type.pls' },
			2: { name: 'entity.name.function.pls' },
		},
	},
	{
		match: `${BEFORE}(${CLASS_KW}|${INTERFACE_KW}|${ENUM_KW}|${TYPE_KW}|${NAMESPACE_KW})${AFTER}\\s+([\\p{L}_$][\\p{L}\\p{N}_$]*)`,
		captures: {
			1: { name: 'storage.type.pls' },
			2: { name: 'entity.name.type.pls' },
		},
	},
);

// Keyword / type / global groups (standalone tokens)
for(const [scope, words] of byScope) {
	patterns.push({
		name: scope,
		match: `${BEFORE}(?:${alternation(words)})${AFTER}`,
	});
}

// Built-in members, only after a dot
patterns.push({
	name: 'support.function.member.pls',
	match: `(?<=\\.)(?:${alternation(members)})${AFTER}`,
});

// Numbers
patterns.push({
	name: 'constant.numeric.pls',
	match: `${BEFORE}(?:0[xX][0-9a-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\\d[\\d_]*)?\\.?\\d[\\d_]*(?:[eE][+-]?\\d+)?n?)${AFTER}`,
});

// Generic function calls (Polish or ASCII identifier immediately before "(")
patterns.push({
	match: `([\\p{L}_$][\\p{L}\\p{N}_$]*)\\s*(?=\\()`,
	captures: { 1: { name: 'entity.name.function.call.pls' } },
});

const grammar = {
	$schema: 'https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json',
	name: 'plscripten (Polski TypeScript)',
	scopeName: 'source.pls',
	fileTypes: ['pls'],
	patterns,
};

const outDir: string = path.join(root, 'editor', 'vscode-plscripten', 'syntaxes');
fs.mkdirSync(outDir, { recursive: true });
const outPath: string = path.join(outDir, 'plscripten.tmLanguage.json');
fs.writeFileSync(outPath, JSON.stringify(grammar, null, '\t') + '\n', 'utf8');

console.log(`Wrote ${path.relative(root, outPath)} (${patterns.length} pattern rules, ${members.length} members).`);
