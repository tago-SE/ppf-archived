import chalk, { ChalkInstance } from "chalk";
import { FileInjectionItem, InjectionResult, JsonInjectionItem, YamlInjectionItem } from "./utils";

export const echo = console.log;

// TODO make better functions names

export function divider() {
    echo(chalk.gray('│'));
}

export function header(title: string, name: string, description: string) {
    echo(`${chalk.cyan('○')} ${chalk.bgBlue(` ${title} `)} ${chalk.magentaBright(name)}`);
    // divider();
    // echo(`${chalk.cyan('○')} ${chalk.bgBlue(' Ready? ')} ${description.replace('${name}', chalk.magentaBright(name))}`);
}

export function footer() {
    echo(`${chalk.red('x')} Take care, see you soon! 👋`)
}

export function congrats() {
    echo(`${chalk.green('●')} Happy coding!`);
}

export function section(title: string, description?: string) {
    echo(`${chalk.green('●')} ${chalk.bgGreen(` ${title} `)}${description ? ' ' + description : ''}`);
}

export function error(message: string, title?: string, prefix?: boolean) {
    echo((prefix ? `${chalk.red('○')} ` : '') + `${chalk.bgRed(` ${title ?? 'ERROR'} `)} ${chalk.red(message)}`);
}

export function content(title: string, sections?: string[], customChalk?: ChalkInstance) {
    const ch = customChalk ? customChalk : chalk.cyan;
    if(sections && sections.length > 0) {
        divider();
        echo(`${ch('○')} ${ch(title)}`);
        sections?.forEach(x => echo(`${chalk.gray('│')} - ${x}`));   
    }
}