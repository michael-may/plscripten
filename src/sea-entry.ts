// EN: Entry point used only by the single-executable (SEA) build. It runs the
// CLI directly with the process arguments.
// PL: Punkt wejścia używany wyłącznie przez build jako pojedynczy plik
// wykonywalny (SEA). Uruchamia CLI bezpośrednio z argumentami procesu.
import { main } from './cli';

main(process.argv.slice(2));
