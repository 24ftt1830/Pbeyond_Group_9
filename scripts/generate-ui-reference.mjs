import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

// Refresh with: node scripts/generate-ui-reference.mjs
// The temporary reference itself is excluded so previews never inflate the audit.
const root = process.cwd();
const sourceRoot = path.join(root, 'resources/js');
const files = [];
function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const full = path.join(directory, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith('.tsx') && !full.includes('UIReference')) files.push(full);
    }
}
walk(sourceRoot);
files.sort();
const modules = new Map();
for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const imports = new Map();
    const constants = new Map();
    function collect(node) {
        if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) constants.set(node.name.text, node.initializer);
        ts.forEachChild(node, collect);
    }
    collect(ast);
    for (const statement of ast.statements) {
        if (!ts.isImportDeclaration(statement) || !statement.importClause) continue;
        const specifier = statement.moduleSpecifier.text;
        let resolved = specifier.startsWith('@/') ? path.join(sourceRoot, specifier.slice(2))
            : specifier.startsWith('.') ? path.resolve(path.dirname(file), specifier) : null;
        if (resolved) resolved = [resolved + '.tsx', path.join(resolved, 'index.tsx')].find(candidate => fs.existsSync(candidate)) ?? null;
        const clause = statement.importClause;
        if (clause.name) imports.set(clause.name.text, { file: resolved, specifier, imported: 'default' });
        if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
            for (const item of clause.namedBindings.elements) imports.set(item.name.text, { file: resolved, specifier, imported: item.propertyName?.text ?? item.name.text });
        }
    }
    modules.set(file, { ast, text, imports, constants });
}

const consumers = new Map();
for (const [file, module] of modules) for (const dependency of module.imports.values()) {
    if (!dependency.file) continue;
    if (!consumers.has(dependency.file)) consumers.set(dependency.file, new Set());
    consumers.get(dependency.file).add(file);
}
const slash = value => value.replaceAll('\\', '/');
const relative = file => slash(path.relative(root, file));
const pageRoutes = {
    'Admin/Dashboard': '/admin/dashboard', 'Admin/Companies': '/admin/companies',
    'Admin/Placements': '/admin/placements', 'Admin/Evaluations': '/admin/evaluations',
    'Admin/AcademicSemesters': '/admin/academic-semesters', 'Admin/ManageUsers': '/admin/manage-users',
    'Admin/StudentRecords': '/admin/students', 'Admin/UnplacedStudents': '/admin/unplaced-students',
};
function contexts(file, visited = new Set()) {
    if (visited.has(file)) return [];
    visited.add(file);
    const name = relative(file).replace('resources/js/Pages/', '').replace(/\.tsx$/, '');
    if (relative(file).startsWith('resources/js/Pages/') && !name.includes('/Partials/')) {
        const role = name.startsWith('Admin/') ? 'Admin' : name.startsWith('Company/') ? 'Company'
            : name.startsWith('Student/') ? 'Student' : name.startsWith('AcademicSupervisor/') ? 'PB Supervisor'
                : name.startsWith('IndustrySupervisor/') ? 'Industry Supervisor'
                    : name.startsWith('Auth/') || name === 'Welcome' ? 'Public / sign-in' : 'Shared';
        return [{ name: name.replace('AcademicSupervisor/', 'PB Supervisor/'), role, href: pageRoutes[name] ?? null }];
    }
    return [...(consumers.get(file) ?? [])].flatMap(parent => contexts(parent, new Set(visited)));
}

function values(expression, module, depth = 0) {
    if (!expression || depth > 5) return [''];
    if (ts.isStringLiteralLike(expression)) return [expression.text];
    if (ts.isJsxExpression(expression)) return values(expression.expression, module, depth + 1);
    if (ts.isParenthesizedExpression(expression)) return values(expression.expression, module, depth + 1);
    if (ts.isIdentifier(expression)) {
        if (module.constants.has(expression.text)) return values(module.constants.get(expression.text), module, depth + 1);
        const imported = module.imports.get(expression.text);
        if (imported?.file && modules.has(imported.file)) {
            const dependency = modules.get(imported.file);
            return values(dependency.constants.get(imported.imported), dependency, depth + 1);
        }
    }
    if (ts.isConditionalExpression(expression)) return [...values(expression.whenTrue, module, depth + 1), ...values(expression.whenFalse, module, depth + 1)];
    if (ts.isBinaryExpression(expression)) {
        if (expression.operatorToken.kind === ts.SyntaxKind.PlusToken) {
            return values(expression.left, module, depth + 1).flatMap(left => values(expression.right, module, depth + 1).map(right => left + right)).slice(0, 8);
        }
        return values(expression.right, module, depth + 1);
    }
    if (ts.isTemplateExpression(expression)) {
        let result = [expression.head.text];
        for (const span of expression.templateSpans) result = result.flatMap(left => values(span.expression, module, depth + 1).map(right => left + right + span.literal.text)).slice(0, 8);
        return result;
    }
    return [''];
}

const categories = [
    ['buttons', 'Buttons', 'Button'], ['confirmations', 'Confirmations & dialogs', 'Confirmation'],
    ['notifications', 'Notifications & alerts', 'Notification'], ['fields', 'Form fields', 'Field'],
    ['badges', 'Status badges', 'Badge'], ['cards', 'Cards & panels', 'Card'],
    ['navigation', 'Tabs & menus', 'Navigation'], ['tables', 'Tables', 'Table'],
    ['states', 'Loading & empty states', 'State'], ['charts', 'Charts & progress', 'Chart'],
    ['identity', 'Typography & assets', 'Asset'],
].map(([id, title, label]) => ({ id, title, label }));
const items = new Map();
function record(category, title, description, kind, file, node, options = {}, key = '') {
    const module = modules.get(file);
    const line = module.ast.getLineAndCharacterOfPosition(node.getStart(module.ast)).line + 1;
    const itemKey = `${category}:${kind}:${key || title}`;
    if (!items.has(itemKey)) items.set(itemKey, { id: '', category, name: '', title, description, kind,
        className: '', variant: 'default', size: 'default', value: '', ...options, sources: [], roles: [], occurrences: 0 });
    const item = items.get(itemKey);
    const existing = item.sources.find(source => source.file === relative(file));
    if (existing) existing.occurrences++;
    else item.sources.push({ file: relative(file), line, occurrences: 1, pages: [...new Map(contexts(file).map(page => [page.name, page])).values()] });
    item.occurrences++;
}
const cleanClass = value => [...new Set(value.trim().split(/\s+/).filter(Boolean))].join(' ');
const legacyButtons = { PrimaryButton: 'legacy-primary', SecondaryButton: 'legacy-secondary', DangerButton: 'legacy-danger' };
const basicFields = { Input: 'input', TextInput: 'text-input', Textarea: 'textarea', Checkbox: 'checkbox', Switch: 'switch', SelectTrigger: 'select', Calendar: 'calendar' };
const menuKinds = { TabsList: 'tabs', AnimatedTabs: 'animated-tabs', DropdownMenuContent: 'dropdown', PopoverContent: 'popover', TooltipContent: 'tooltip', Pagination: 'pagination', SidebarMenuButton: 'sidebar' };
function componentClass(module, name) {
    let result = '';
    function find(node) {
        if (ts.isFunctionDeclaration(node) && node.name?.text === name) {
            function firstElement(child) {
                if (!result && (ts.isJsxOpeningElement(child) || ts.isJsxSelfClosingElement(child))) {
                    const attribute = child.attributes.properties.find(attribute => ts.isJsxAttribute(attribute) && attribute.name.text === 'className');
                    result = values(attribute?.initializer, module)[0] ?? '';
                }
                if (!result) ts.forEachChild(child, firstElement);
            }
            firstElement(node);
        }
        if (!result) ts.forEachChild(node, find);
    }
    find(module.ast);
    return cleanClass(result);
}

for (const [file, module] of modules) {
    // Count use of primitives, rather than their internal implementation markup.
    if (relative(file).startsWith('resources/js/Components/ui/')) continue;
    function visit(node) {
        if (ts.isCallExpression(node)) {
            const call = node.expression.getText(module.ast);
            if (call === 'window.confirm' || call === 'confirm') record('confirmations', 'Browser confirmation', 'The browser controls its appearance. Used for deletions, rejections and cancellation.', 'native-confirm', file, node);
            if (/^toast\.(success|error|warning|info|loading)$/.test(call)) {
                const tone = call.split('.')[1];
                const settings = node.arguments[1]?.getText(module.ast) ?? '';
                const mode = /\baction\s*:/.test(settings) ? 'action' : /\bdescription\s*:/.test(settings) ? 'description' : '';
                record('notifications', `${tone[0].toUpperCase() + tone.slice(1)} toast${mode ? ' with ' + mode : ''}`, 'A temporary Sonner notification using the existing site-wide toaster.', 'toast', file, node, { variant: tone, value: mode });
            }
        }
        if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
            const tag = node.tagName.getText(module.ast);
            const attrs = new Map(node.attributes.properties.filter(ts.isJsxAttribute).map(attribute => [attribute.name.text, attribute.initializer]));
            const attr = key => values(attrs.get(key), module)[0] || '';
            const styleOptions = [...new Set(values(attrs.get('className'), module).map(cleanClass))].slice(0, 8);
            const baseStyle = styleOptions[0] ?? '';
            if (tag === 'Button') {
                const variant = attr('variant') || 'default';
                const size = attr('size') || 'default';
                for (const className of styleOptions) record('buttons', `Shared button · ${variant}${size !== 'default' ? ' / ' + size : ''}`, className ? 'Shared Button with a page-specific style override.' : 'The shared Button component without a page-specific style override.', 'button', file, node, { variant, size, className }, `${variant}:${size}:${className}`);
            } else if (legacyButtons[tag]) {
                record('buttons', tag.replace('Button', ' button'), 'Uppercase, widely spaced lettering from the account and authentication forms.', legacyButtons[tag], file, node);
            } else if (tag === 'button' && baseStyle) {
                for (const className of styleOptions.filter(Boolean)) record('buttons', className.includes('rounded-full') ? 'Custom pill button' : className.includes('text-rose') || className.includes('text-red') ? 'Custom danger action' : 'Custom page button', 'A native button styled directly on its page. Compare its colour, corners, spacing and text with other button types.', 'native-button', file, node, { className }, className);
            }
            if (tag === 'AlertDialog' || tag === 'ConfirmAction') record('confirmations', 'Styled confirmation dialog', 'The shared Radix confirmation with a title, explanation, Cancel and Confirm actions.', 'alert-dialog', file, node);
            if (tag === 'DialogContent') record('confirmations', 'Form dialog', 'The shared Radix dialog used for editing records, setting dates and creating accounts.', 'dialog', file, node, { className: baseStyle }, baseStyle);
            if (tag === 'Modal') record('confirmations', 'Account confirmation modal', 'The Headless UI modal used by the account deletion form, with a password field.', 'legacy-modal', file, node);
            if (tag === 'Alert') record('notifications', `Inline alert · ${attr('variant') || 'default'}`, 'The shared Alert component appears inside the page rather than in a toast.', 'alert', file, node, { variant: attr('variant') || 'default', className: baseStyle }, `${attr('variant')}:${baseStyle}`);
            if (tag === 'Errors') record('notifications', 'Form error summary', 'A rose panel listing form errors above the affected controls.', 'errors', file, node);
            if (tag === 'InputError' || tag === 'FieldError') record('notifications', 'Field error message', 'An error directly beneath an individual field.', 'field-error', file, node);
            if (tag === 'Transition') {
                const text = node.parent.getText(module.ast);
                if (text.includes('recentlySuccessful')) record('notifications', 'Saved confirmation text', 'A short Saved message that fades beside the account form action.', 'saved', file, node);
            }
            const isFlashMessage = ts.isJsxElement(node.parent) && node.parent.children.some(child => ts.isJsxExpression(child) && /^\{\s*flash\??\.(success|error)\s*\}$/.test(child.getText(module.ast)));
            if ((tag === 'div' || tag === 'p') && (attr('role') === 'alert' || attr('role') === 'status' || isFlashMessage)) {
                if (baseStyle) record('notifications', attr('role') === 'status' ? 'Persistent status notice' : 'Inline page message', 'A page-specific message panel, including validation, flash feedback and date-change notices.', 'notice', file, node, { className: baseStyle }, baseStyle);
            }
            if (basicFields[tag]) record('fields', tag === 'TextInput' ? 'Account text input' : `Shared ${basicFields[tag]}`, 'An existing shared form control. Page-specific overrides are listed separately.', basicFields[tag], file, node, { className: baseStyle }, `${tag}:${baseStyle}`);
            if (['input', 'textarea', 'select'].includes(tag)) {
                const type = tag === 'input' ? attr('type') || 'text' : tag;
                record('fields', `Native ${type} field`, 'A form control styled directly on the page.', type === 'file' ? 'file' : type === 'checkbox' ? 'native-checkbox' : type === 'textarea' ? 'textarea' : type === 'select' ? 'native-select' : 'native-input', file, node, { className: baseStyle, value: type }, `${type}:${baseStyle}`);
            }
            if (tag === 'Badge') record('badges', `Shared badge · ${attr('variant') || 'default'}`, 'The shared badge primitive, including any page-specific colour overrides.', 'badge', file, node, { className: baseStyle, variant: attr('variant') || 'default' }, `${attr('variant')}:${baseStyle}`);
            if (tag === 'span' && /rounded-(full|md|lg)/.test(baseStyle) && /bg-|ring-/.test(baseStyle) && /text-xs|text-\[/.test(baseStyle)) {
                for (const className of styleOptions) record('badges', 'Custom status badge', 'A page-specific pill or label. Colours and corner styles are taken from its source.', 'native-badge', file, node, { className }, className);
            }
            if (['Card', 'RecordPanel', 'SectionCard'].includes(tag)) {
                const className = tag === 'SectionCard' ? componentClass(module, tag) : baseStyle;
                record('cards', `${tag === 'Card' ? 'Shared card' : tag === 'RecordPanel' ? 'Record panel' : 'Student detail section'}`, 'An existing card family used to divide page content.', tag === 'RecordPanel' ? 'record-panel' : tag === 'SectionCard' ? 'native-card' : 'card', file, node, { className }, `${tag}:${className}`);
            }
            if (['section', 'article'].includes(tag) && baseStyle.includes('rounded') && baseStyle.includes('border')) record('cards', 'Custom content panel', 'A native section with its own border, corners and spacing.', 'native-card', file, node, { className: baseStyle }, baseStyle);
            if (menuKinds[tag]) record('navigation', tag.replace(/Content$|List$/, '').replace(/([a-z])([A-Z])/g, '$1 $2'), 'An existing navigation or contextual menu pattern.', menuKinds[tag], file, node, { className: baseStyle }, `${tag}:${baseStyle}`);
            if (tag === 'DataTable' || tag === 'Table' || tag === 'table') record('tables', tag === 'DataTable' ? 'Sortable data table' : tag === 'Table' ? 'Shared table' : 'Native HTML table', 'An existing tabular layout; example rows contain demo data.', tag === 'DataTable' ? 'data-table' : 'table', file, node, { className: baseStyle }, `${tag}:${baseStyle}`);
            if (tag === 'EmptyState') record('states', 'Text empty state', 'A neutral message shown when a section has no records.', 'empty', file, node, { className: componentClass(module, tag) });
            if (tag === 'Skeleton') record('states', 'Skeleton placeholder', 'An animated placeholder from the shared component library.', 'skeleton', file, node);
            if (baseStyle.includes('animate-spin')) record('states', 'Loading spinner', 'An animated icon used while an action or search is in progress.', 'spinner', file, node);
            if (['BarChart', 'LineChart', 'AreaChart', 'PieChart', 'RadarChart', 'RadialBarChart'].includes(tag)) record('charts', tag.replace('Chart', ' chart'), 'The chart component used by the existing website, rendered with sample values.', 'chart', file, node, { variant: tag });
            if (tag === 'Progress' || attr('role') === 'progressbar') record('charts', 'Progress indicator', 'A visual indicator of completion or progress.', 'progress', file, node);
            if (tag === 'h1') record('identity', 'Page heading', 'An existing page-title style. Compare font size, weight and family.', 'heading', file, node, { className: baseStyle }, baseStyle);
            if (tag === 'img') {
                const src = attr('src');
                if (src.startsWith('/') && fs.existsSync(path.join(root, 'public', src))) record('identity', 'Image asset · ' + src.split('/').at(-1), 'An existing image used in the interface.', 'image', file, node, { value: src }, src);
                else record('identity', 'Dynamic image / avatar', 'An image supplied by a user record or imported asset; this example uses initials.', 'avatar', file, node);
            }
            if (tag === 'Avatar') record('identity', 'Shared avatar', 'The shared circular account/avatar component.', 'avatar', file, node);
            if (module.imports.get(tag)?.specifier === 'lucide-react') record('identity', 'Lucide icons', 'The existing icon library. Source references show where icons are used.', 'icons', file, node);
        }
        ts.forEachChild(node, visit);
    }
    visit(module.ast);
}

const counters = {};
const result = [...items.values()].sort((a, b) => categories.findIndex(category => category.id === a.category) - categories.findIndex(category => category.id === b.category));
for (const item of result) {
    const category = categories.find(category => category.id === item.category);
    counters[item.category] = (counters[item.category] ?? 0) + 1;
    item.id = `${item.category}-${counters[item.category]}`;
    item.name = `${category.label} Type ${counters[item.category]}`;
    item.roles = [...new Set(item.sources.flatMap(source => source.pages.map(page => page.role)))].sort();
    if (!item.roles.length) item.roles = ['Shared'];
}
const data = { scannedAt: new Date().toISOString(), scannedFiles: files.length, categories, items: result };
const target = path.join(sourceRoot, 'data/ui-reference-inventory.ts');
fs.mkdirSync(path.dirname(target), { recursive: true });
const types = `// Generated by scripts/generate-ui-reference.mjs. Refresh after changing the UI.\nexport type UIReferenceItem = {\n    id: string; category: string; name: string; title: string; description: string; kind: string;\n    className: string; variant: string; size: string; value: string; roles: string[]; occurrences: number;\n    sources: { file: string; line: number; occurrences: number; pages: { name: string; role: string; href: string | null }[] }[];\n};\nexport const uiInventory: { scannedAt: string; scannedFiles: number; categories: { id: string; title: string; label: string }[]; items: UIReferenceItem[] } = `;
fs.writeFileSync(target, types + JSON.stringify(data, null, 2) + ';\n');
console.log(JSON.stringify({ scannedFiles: files.length, variants: result.length, categories: counters }, null, 2));
