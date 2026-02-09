import { useNode } from '@craftjs/core';
import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';

interface TableData {
  headers: string[];
  rows: string[][];
}

interface TableProps {
  data: TableData;
  striped: boolean;
}

export const Table = ({ 
  data = {
    headers: ['Column 1', 'Column 2', 'Column 3'],
    rows: [
      ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
      ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
    ],
  },
  striped = true
}: Partial<TableProps>) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div ref={(ref) => { if (ref) connect(drag(ref)); }} className="mb-4">
      <ShadcnTable>
        <TableHeader>
          <TableRow>
            {data.headers.map((header, index) => (
              <TableHead key={index}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.map((row, rowIndex) => (
            <TableRow key={rowIndex} className={striped && rowIndex % 2 === 1 ? 'bg-muted/50' : ''}>
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </ShadcnTable>
    </div>
  );
};

Table.craft = {
  displayName: 'Table',
  props: {
    data: {
      headers: ['Column 1', 'Column 2', 'Column 3'],
      rows: [
        ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
        ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
      ],
    },
    striped: true,
  },
  related: {
    settings: TableSettings,
  },
};

function TableSettings() {
  const {
    actions: { setProp },
    data,
    striped,
  } = useNode((node) => ({
    data: node.data?.props?.data,
    striped: node.data?.props?.striped,
  }));

  const addColumn = () => {
    setProp((props: TableProps) => {
      props.data.headers.push(`Column ${props.data.headers.length + 1}`);
      props.data.rows.forEach(row => row.push(''));
    });
  };

  const addRow = () => {
    setProp((props: TableProps) => {
      props.data.rows.push(new Array(props.data.headers.length).fill(''));
    });
  };

  const removeColumn = (index: number) => {
    setProp((props: TableProps) => {
      props.data.headers.splice(index, 1);
      props.data.rows.forEach(row => row.splice(index, 1));
    });
  };

  const removeRow = (index: number) => {
    setProp((props: TableProps) => {
      props.data.rows.splice(index, 1);
    });
  };

  const updateHeader = (index: number, value: string) => {
    setProp((props: TableProps) => {
      props.data.headers[index] = value;
    });
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    setProp((props: TableProps) => {
      props.data.rows[rowIndex][colIndex] = value;
    });
  };

  return (
    <div className="space-y-4 p-4 max-h-[600px] overflow-y-auto">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={striped}
          onChange={(e) => setProp((props: TableProps) => (props.striped = e.target.checked))}
          className="w-4 h-4"
        />
        <label className="text-sm font-medium">Striped rows</label>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Headers</label>
          <button
            onClick={addColumn}
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
          >
            Add Column
          </button>
        </div>
        {data.headers.map((header: string, index: number) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={header}
              onChange={(e) => updateHeader(index, e.target.value)}
              className="flex-1 px-2 py-1 border rounded text-sm"
            />
            {data.headers.length > 1 && (
              <button
            onClick={() => removeColumn(index)}
            className="px-2 py-1 text-red-600 text-sm"
              >
            ×
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Rows</label>
          <button
            onClick={addRow}
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
          >
            Add Row
          </button>
        </div>
        {data.rows.map((row: string[], rowIndex: number) => (
          <div key={rowIndex} className="border rounded p-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium">Row {rowIndex + 1}</span>
              {data.rows.length > 1 && (
            <button
              onClick={() => removeRow(rowIndex)}
              className="text-xs text-red-600"
            >
              Remove
            </button>
              )}
            </div>
            {row.map((cell: string, colIndex: number) => (
              <input
            key={colIndex}
            type="text"
            value={cell}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCell(rowIndex, colIndex, e.target.value)}
            placeholder={data.headers[colIndex]}
            className="w-full px-2 py-1 border rounded text-sm"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}