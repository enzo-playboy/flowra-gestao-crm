import { NoteList } from "@/components/anotacoes/note-list";

export default function AnotacoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Anotacoes</h2>
        <p className="text-muted mt-1">Suas anotacoes e ideias</p>
      </div>
      <NoteList />
    </div>
  );
}
