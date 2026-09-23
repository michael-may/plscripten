import ts from 'typescript';

import { ENGLISH_TO_POLISH, POLISH_TO_ENGLISH, TranslationDirection } from './dictionary';

// EN: Turns Polish source into standard TypeScript (and back). Works at the
// token level using the TypeScript scanner, so only real identifier / keyword
// tokens are ever substituted. String contents, template literal text,
// comments, regular expressions and all whitespace are copied through verbatim,
// which keeps translation lossless for everything that is not a language word.
// PL: Zamienia polski kod na standardowy TypeScript (i odwrotnie). Działa na
// poziomie tokenów przy użyciu skanera TypeScript, więc podstawiane są tylko
// prawdziwe tokeny identyfikatorów / słów kluczowych. Treść napisów, szablonów,
// komentarzy, wyrażeń regularnych oraz wszystkie białe znaki są kopiowane
// dosłownie, dzięki czemu tłumaczenie jest bezstratne dla wszystkiego, co nie
// jest słowem języka.
export class Translator {
	// EN: True while the scanner sits on a token whose text is a candidate word.
	// PL: Prawda, gdy skaner stoi na tokenie, którego tekst jest kandydatem na słowo.
	private static isWordToken(kind: ts.SyntaxKind): boolean {
		if(kind === ts.SyntaxKind.Identifier) {
			return true;
		}

		// EN: Every reserved / contextual keyword falls in this contiguous range.
		// PL: Każde słowo zastrzeżone / kontekstowe mieści się w tym ciągłym zakresie.
		return kind >= ts.SyntaxKind.FirstKeyword && kind <= ts.SyntaxKind.LastKeyword;
	}

	// EN: Tokens after which a `/` is division, not the start of a regex. After
	// anything else the `/` begins a regular expression literal.
	// PL: Tokeny, po których `/` oznacza dzielenie, a nie początek wyrażenia
	// regularnego. Po czymkolwiek innym `/` zaczyna literał wyrażenia regularnego.
	private static endsValue(kind: ts.SyntaxKind): boolean {
		switch(kind) {
			case ts.SyntaxKind.Identifier:
			case ts.SyntaxKind.NumericLiteral:
			case ts.SyntaxKind.BigIntLiteral:
			case ts.SyntaxKind.StringLiteral:
			case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
			case ts.SyntaxKind.TemplateTail:
			case ts.SyntaxKind.CloseParenToken:
			case ts.SyntaxKind.CloseBracketToken:
			case ts.SyntaxKind.CloseBraceToken:
			case ts.SyntaxKind.ThisKeyword:
			case ts.SyntaxKind.SuperKeyword:
			case ts.SyntaxKind.TrueKeyword:
			case ts.SyntaxKind.FalseKeyword:
			case ts.SyntaxKind.NullKeyword:
			case ts.SyntaxKind.PlusPlusToken:
			case ts.SyntaxKind.MinusMinusToken:
				return true;
			default:
				return false;
		}
	}

	private translateWith(source: string, dictionary: ReadonlyMap<string, string>): string {
		// EN: skipTrivia = false so whitespace and comments arrive as their own
		// tokens and getTokenText returns their exact text — nothing is lost.
		// PL: skipTrivia = false, aby białe znaki i komentarze przychodziły jako
		// osobne tokeny, a getTokenText zwracał ich dokładny tekst — nic nie ginie.
		const scanner = ts.createScanner(
			ts.ScriptTarget.Latest,
			false,
			ts.LanguageVariant.Standard,
			source
		);

		const pieces: string[] = [];

		// EN: One entry per open `${` substitution; the value is the current
		// nested-brace depth so we know which `}` closes the template hole.
		// PL: Jeden wpis na każde otwarte `${`; wartość to bieżąca głębokość
		// zagnieżdżonych klamer, byśmy wiedzieli, które `}` zamyka dziurę szablonu.
		const templateStack: number[] = [];
		let previous = ts.SyntaxKind.Unknown;
		let token = scanner.scan();

		while(token !== ts.SyntaxKind.EndOfFileToken) {
			// EN: Disambiguate `/` — re-scan as a regex when a value cannot precede.
			// PL: Rozróżnia `/` — przeskanuj jako regex, gdy nie może go poprzedzać wartość.
			if((token === ts.SyntaxKind.SlashToken || token === ts.SyntaxKind.SlashEqualsToken) && !Translator.endsValue(previous)) {
				token = scanner.reScanSlashToken();
			}

			// EN: A `}` may actually resume a template literal; re-scan it if we
			// are sitting directly inside a `${ ... }` hole (brace depth zero).
			// PL: `}` może w rzeczywistości wznawiać literał szablonu; przeskanuj
			// go, jeśli jesteśmy wprost w dziurze `${ ... }` (głębokość klamer zero).
			if(token === ts.SyntaxKind.CloseBraceToken && templateStack.length) {
				const top = templateStack.length - 1;

				if(templateStack[top] === 0) {
					token = scanner.reScanTemplateToken(false);

					if(token === ts.SyntaxKind.TemplateTail) {
						templateStack.pop();
					}
				}
				else {
					templateStack[top]--;
				}
			}
			else if(token === ts.SyntaxKind.OpenBraceToken && templateStack.length) {
				templateStack[templateStack.length - 1]++;
			}

			// EN: Entering a new `${` hole — start tracking its brace depth.
			// PL: Wejście w nową dziurę `${` — zaczynamy śledzić głębokość klamer.
			if(token === ts.SyntaxKind.TemplateHead) {
				templateStack.push(0);
			}

			const text = scanner.getTokenText();

			if(Translator.isWordToken(token)) {
				const replacement = dictionary.get(text);
				pieces.push(replacement !== undefined ? replacement : text);
			}
			else {
				pieces.push(text);
			}

			// EN: Track the last non-trivia token for the regex heuristic.
			// PL: Śledzi ostatni token niebędący trywialnym dla heurystyki regex.
			if(token !== ts.SyntaxKind.WhitespaceTrivia
				&& token !== ts.SyntaxKind.NewLineTrivia
				&& token !== ts.SyntaxKind.SingleLineCommentTrivia
				&& token !== ts.SyntaxKind.MultiLineCommentTrivia) {
				previous = token;
			}

			token = scanner.scan();
		}

		return pieces.join('');
	}

	// EN: Polish (.pls) -> standard TypeScript.
	// PL: Polski (.pls) -> standardowy TypeScript.
	public toEnglish(source: string): string {
		return this.translateWith(source, POLISH_TO_ENGLISH);
	}

	// EN: Standard TypeScript / JavaScript -> Polish (.pls).
	// PL: Standardowy TypeScript / JavaScript -> polski (.pls).
	public toPolish(source: string): string {
		return this.translateWith(source, ENGLISH_TO_POLISH);
	}

	public translate(source: string, direction: TranslationDirection): string {
		if(direction === TranslationDirection.ToPolish) {
			return this.toPolish(source);
		}

		return this.toEnglish(source);
	}
}

// EN: A shared instance is enough — the translator holds no per-call state.
// PL: Wystarczy jedna współdzielona instancja — tłumacz nie trzyma stanu.
export const translator = new Translator();
