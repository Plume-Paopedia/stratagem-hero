import { useState, useCallback, useRef } from 'react';
import { Button } from '../ui/Button';
import { downloadExport, importData, getDataSizeKB } from '../../utils/dataExport';

export function DataManagement() {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    downloadExport();
  }, []);

  const handleImport = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = importData(reader.result as string);
      if (result.success) {
        setImportStatus('Import successful! Reload to apply changes.');
      } else {
        setImportStatus(`Error: ${result.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const sizeKB = getDataSizeKB();

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-heading text-sm text-hd-gray uppercase tracking-wider">
        Data Management
      </h3>
      <div className="text-xs text-hd-gray/60">
        Local storage: ~{sizeKB}KB used
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={handleExport}>
          Export All Data
        </Button>
        <Button variant="secondary" size="sm" onClick={handleImport}>
          Import Backup
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {importStatus && (
        <div className={`text-xs font-heading ${importStatus.startsWith('Error') ? 'text-hd-red' : 'text-green-400'}`}>
          {importStatus}
        </div>
      )}
    </div>
  );
}
