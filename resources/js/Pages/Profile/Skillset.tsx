import AccountSectionLayout from './Partials/AccountSectionLayout';
import { useState } from 'react';

interface LanguageEntry {
    id: number;
    language: string;
    level: string;
}

interface ITLiteracyEntry {
    id: number;
    name: string;
    level: string;
}

export default function Skillset() {
    const [languages, setLanguages] = useState<LanguageEntry[]>([]);
    const [itLiteracies, setItLiteracies] = useState<ITLiteracyEntry[]>([]);
    const [addingLanguage, setAddingLanguage] = useState(false);
    const [addingIT, setAddingIT] = useState(false);
    const [newLanguage, setNewLanguage] = useState({ language: '', level: '' });
    const [newIT, setNewIT] = useState({ name: '', level: '' });

    const removeLanguage = (id: number) => {
        setLanguages(languages.filter(lang => lang.id !== id));
    };

    const removeItLiteracy = (id: number) => {
        setItLiteracies(itLiteracies.filter(it => it.id !== id));
    };

    const applyLanguage = () => {
        if (newLanguage.language.trim() && newLanguage.level.trim()) {
            setLanguages([
                ...languages,
                {
                    id: Date.now(),
                    language: newLanguage.language,
                    level: newLanguage.level,
                },
            ]);
            setNewLanguage({ language: '', level: '' });
            setAddingLanguage(false);
        }
    };

    const applyIT = () => {
        if (newIT.name.trim() && newIT.level.trim()) {
            setItLiteracies([
                ...itLiteracies,
                {
                    id: Date.now(),
                    name: newIT.name,
                    level: newIT.level,
                },
            ]);
            setNewIT({ name: '', level: '' });
            setAddingIT(false);
        }
    };

    return (
        <AccountSectionLayout title="Skillset">
            <div className="space-y-8">
                {/* Languages Section */}
                <div className="mx-auto max-w-4xl rounded-xl border border-black/10 bg-white p-6 shadow">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold text-black">Languages</h3>
                        <button
                            onClick={() => setAddingLanguage(true)}
                            disabled={addingLanguage}
                            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
                        >
                            Add
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-black/10 bg-black/5">
                                    <th className="px-4 py-3 font-semibold text-black w-12">No.</th>
                                    <th className="px-4 py-3 font-semibold text-black">Language</th>
                                    <th className="px-4 py-3 font-semibold text-black">Level</th>
                                    <th className="px-4 py-3 font-semibold text-black w-24">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {addingLanguage && (
                                    <tr className="border-b border-black/10 bg-black/2">
                                        <td className="px-4 py-3 text-black">-</td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                placeholder="Language"
                                                value={newLanguage.language}
                                                onChange={(e) =>
                                                    setNewLanguage({ ...newLanguage, language: e.target.value })
                                                }
                                                className="w-full rounded-md border border-black/20 px-2 py-1 text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                placeholder="Level"
                                                value={newLanguage.level}
                                                onChange={(e) =>
                                                    setNewLanguage({ ...newLanguage, level: e.target.value })
                                                }
                                                className="w-full rounded-md border border-black/20 px-2 py-1 text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-3 flex gap-2">
                                            <button
                                                onClick={applyLanguage}
                                                className="text-sm text-green-600 hover:text-green-800"
                                            >
                                                Apply
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setAddingLanguage(false);
                                                    setNewLanguage({ language: '', level: '' });
                                                }}
                                                className="text-sm text-gray-600 hover:text-gray-800"
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    </tr>
                                )}
                                {languages.length > 0 ? (
                                    languages.map((entry, index) => (
                                        <tr key={entry.id} className="border-b border-black/10 hover:bg-black/2">
                                            <td className="px-4 py-3 text-black">{index + 1}</td>
                                            <td className="px-4 py-3 text-black">{entry.language}</td>
                                            <td className="px-4 py-3 text-black">{entry.level}</td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => removeLanguage(entry.id)}
                                                    className="text-sm text-red-600 hover:text-red-800"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : !addingLanguage ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-3 text-center text-black/70">
                                            No language records yet.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* IT Literacy Section */}
                <div className="mx-auto max-w-4xl rounded-xl border border-black/10 bg-white p-6 shadow">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold text-black">IT Literacy</h3>
                        <button
                            onClick={() => setAddingIT(true)}
                            disabled={addingIT}
                            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
                        >
                            Add
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-black/10 bg-black/5">
                                    <th className="px-4 py-3 font-semibold text-black w-12">No.</th>
                                    <th className="px-4 py-3 font-semibold text-black">IT Literacy</th>
                                    <th className="px-4 py-3 font-semibold text-black">Level</th>
                                    <th className="px-4 py-3 font-semibold text-black w-24">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {addingIT && (
                                    <tr className="border-b border-black/10 bg-black/2">
                                        <td className="px-4 py-3 text-black">-</td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                placeholder="IT Literacy"
                                                value={newIT.name}
                                                onChange={(e) =>
                                                    setNewIT({ ...newIT, name: e.target.value })
                                                }
                                                className="w-full rounded-md border border-black/20 px-2 py-1 text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                placeholder="Level"
                                                value={newIT.level}
                                                onChange={(e) =>
                                                    setNewIT({ ...newIT, level: e.target.value })
                                                }
                                                className="w-full rounded-md border border-black/20 px-2 py-1 text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-3 flex gap-2">
                                            <button
                                                onClick={applyIT}
                                                className="text-sm text-green-600 hover:text-green-800"
                                            >
                                                Apply
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setAddingIT(false);
                                                    setNewIT({ name: '', level: '' });
                                                }}
                                                className="text-sm text-gray-600 hover:text-gray-800"
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    </tr>
                                )}
                                {itLiteracies.length > 0 ? (
                                    itLiteracies.map((entry, index) => (
                                        <tr key={entry.id} className="border-b border-black/10 hover:bg-black/2">
                                            <td className="px-4 py-3 text-black">{index + 1}</td>
                                            <td className="px-4 py-3 text-black">{entry.name}</td>
                                            <td className="px-4 py-3 text-black">{entry.level}</td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => removeItLiteracy(entry.id)}
                                                    className="text-sm text-red-600 hover:text-red-800"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : !addingIT ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-3 text-center text-black/70">
                                            No IT literacy records yet.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AccountSectionLayout>
    );
}
