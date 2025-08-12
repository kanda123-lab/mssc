import { VisualQuery, QueryTable, SelectedColumn, WhereCondition, QueryJoin, OrderByColumn, InsertData, UpdateData, CreateTableData, CTE, WindowFunction, UnionOperation } from '@/types';

export class VisualQueryGenerator {
  private dialect: string;

  constructor(dialect: string = 'postgresql') {
    this.dialect = dialect;
  }

  generateSQL(query: VisualQuery): string {
    try {
      switch (query.type) {
        case 'SELECT':
          return this.generateSelectQuery(query);
        case 'INSERT':
          return this.generateInsertQuery(query);
        case 'UPDATE':
          return this.generateUpdateQuery(query);
        case 'DELETE':
          return this.generateDeleteQuery(query);
        case 'CREATE_TABLE':
          return this.generateCreateTableQuery(query);
        case 'ALTER_TABLE':
          return this.generateAlterTableQuery(query);
        default:
          throw new Error(`Unsupported query type: ${query.type}`);
      }
    } catch (error) {
      console.error('SQL Generation Error:', error);
      throw error;
    }
  }

  private generateSelectQuery(query: VisualQuery): string {
    let sql = '';

    // Common Table Expressions (CTEs)
    if (query.ctes && query.ctes.length > 0) {
      sql += this.generateCTEs(query.ctes) + '\n';
    }

    // SELECT clause
    sql += 'SELECT ';
    if (query.selectColumns.length === 0) {
      sql += '*';
    } else {
      sql += query.selectColumns
        .map(col => this.generateSelectColumn(col))
        .join(',\n  ');
    }

    // Window functions
    if (query.windowFunctions && query.windowFunctions.length > 0) {
      const windowFunctions = query.windowFunctions.map(wf => this.generateWindowFunction(wf));
      if (query.selectColumns.length > 0) {
        sql += ',\n  ' + windowFunctions.join(',\n  ');
      } else {
        sql = 'SELECT ' + windowFunctions.join(',\n  ');
      }
    }

    // FROM clause
    if (query.tables.length > 0) {
      sql += '\nFROM ' + this.generateFromClause(query.tables[0]);

      // JOINs
      if (query.joins.length > 0) {
        sql += '\n' + query.joins.map(join => this.generateJoin(join, query.tables)).join('\n');
      }
    }

    // WHERE clause
    if (query.whereConditions.length > 0) {
      sql += '\nWHERE ' + this.generateWhereClause(query.whereConditions);
    }

    // GROUP BY clause
    if (query.groupByColumns.length > 0) {
      sql += '\nGROUP BY ' + query.groupByColumns.join(', ');
    }

    // HAVING clause
    if (query.havingConditions.length > 0) {
      sql += '\nHAVING ' + this.generateWhereClause(query.havingConditions);
    }

    // ORDER BY clause
    if (query.orderByColumns.length > 0) {
      sql += '\nORDER BY ' + query.orderByColumns
        .map(col => this.generateOrderByColumn(col))
        .join(', ');
    }

    // LIMIT and OFFSET
    if (query.limit !== undefined) {
      sql += this.generateLimitClause(query.limit, query.offset);
    }

    // UNION operations
    if (query.unions && query.unions.length > 0) {
      sql += '\n' + query.unions
        .map(union => this.generateUnion(union))
        .join('\n');
    }

    return sql;
  }

  private generateInsertQuery(query: VisualQuery): string {
    if (!query.insertData || query.tables.length === 0) {
      throw new Error('Insert query requires table and data');
    }

    const table = query.tables[0];
    const data = query.insertData;
    
    let sql = `INSERT INTO ${this.escapeIdentifier(table.name)}`;

    if (data.columns.length > 0) {
      sql += ` (${data.columns.map(col => this.escapeIdentifier(col)).join(', ')})`;
    }

    sql += '\nVALUES ';
    
    const values = data.values.map(row => {
      const rowValues = data.columns.map(col => this.formatValue(row[col]));
      return `(${rowValues.join(', ')})`;
    });

    sql += values.join(',\n  ');

    // Handle conflict resolution
    if (data.onConflict) {
      switch (this.dialect) {
        case 'mysql':
          if (data.onConflict === 'IGNORE') {
            sql = sql.replace('INSERT INTO', 'INSERT IGNORE INTO');
          } else if (data.onConflict === 'UPDATE') {
            sql += '\nON DUPLICATE KEY UPDATE ' + 
              data.columns.map(col => `${this.escapeIdentifier(col)} = VALUES(${this.escapeIdentifier(col)})`).join(', ');
          }
          break;
        case 'postgresql':
          if (data.onConflict === 'IGNORE') {
            sql += '\nON CONFLICT DO NOTHING';
          } else if (data.onConflict === 'UPDATE') {
            sql += '\nON CONFLICT DO UPDATE SET ' +
              data.columns.map(col => `${this.escapeIdentifier(col)} = EXCLUDED.${this.escapeIdentifier(col)}`).join(', ');
          }
          break;
      }
    }

    return sql;
  }

  private generateUpdateQuery(query: VisualQuery): string {
    if (!query.updateData || query.tables.length === 0) {
      throw new Error('Update query requires table and data');
    }

    const table = query.tables[0];
    const data = query.updateData;
    
    let sql = `UPDATE ${this.escapeIdentifier(table.name)}`;

    sql += '\nSET ' + data.setClause
      .map(set => `${this.escapeIdentifier(set.column)} = ${set.isExpression ? set.value : this.formatValue(set.value)}`)
      .join(',\n    ');

    // WHERE clause
    if (query.whereConditions.length > 0) {
      sql += '\nWHERE ' + this.generateWhereClause(query.whereConditions);
    }

    return sql;
  }

  private generateDeleteQuery(query: VisualQuery): string {
    if (query.tables.length === 0) {
      throw new Error('Delete query requires a table');
    }

    const table = query.tables[0];
    let sql = `DELETE FROM ${this.escapeIdentifier(table.name)}`;

    // WHERE clause
    if (query.whereConditions.length > 0) {
      sql += '\nWHERE ' + this.generateWhereClause(query.whereConditions);
    }

    return sql;
  }

  private generateCreateTableQuery(query: VisualQuery): string {
    if (!query.createTableData) {
      throw new Error('Create table query requires table definition');
    }

    const data = query.createTableData;
    let sql = 'CREATE TABLE ';
    
    if (data.ifNotExists) {
      sql += 'IF NOT EXISTS ';
    }
    
    sql += `${this.escapeIdentifier(data.tableName)} (\n`;

    // Columns
    const columnDefinitions = data.columns.map(col => {
      let def = `  ${this.escapeIdentifier(col.name)} ${col.type}`;
      
      if (!col.nullable) {
        def += ' NOT NULL';
      }
      
      if (col.defaultValue !== undefined) {
        def += ` DEFAULT ${this.formatValue(col.defaultValue)}`;
      }
      
      if (col.autoIncrement) {
        switch (this.dialect) {
          case 'mysql':
            def += ' AUTO_INCREMENT';
            break;
          case 'postgresql':
            def = def.replace(col.type, 'SERIAL');
            break;
          case 'sqlite':
            def += ' AUTOINCREMENT';
            break;
        }
      }
      
      if (col.unique) {
        def += ' UNIQUE';
      }
      
      if (col.comment) {
        def += ` COMMENT '${col.comment}'`;
      }
      
      return def;
    });

    sql += columnDefinitions.join(',\n');

    // Primary key
    if (data.primaryKey && data.primaryKey.length > 0) {
      sql += `,\n  PRIMARY KEY (${data.primaryKey.map(col => this.escapeIdentifier(col)).join(', ')})`;
    }

    // Foreign keys
    if (data.foreignKeys && data.foreignKeys.length > 0) {
      data.foreignKeys.forEach(fk => {
        sql += `,\n  FOREIGN KEY (${fk.columns.map(col => this.escapeIdentifier(col)).join(', ')}) ` +
               `REFERENCES ${this.escapeIdentifier(fk.referencedTable)} (${fk.referencedColumns.map(col => this.escapeIdentifier(col)).join(', ')})`;
        
        if (fk.onDelete) {
          sql += ` ON DELETE ${fk.onDelete}`;
        }
        if (fk.onUpdate) {
          sql += ` ON UPDATE ${fk.onUpdate}`;
        }
      });
    }

    // Constraints
    if (data.constraints && data.constraints.length > 0) {
      data.constraints.forEach(constraint => {
        sql += `,\n  CONSTRAINT ${this.escapeIdentifier(constraint.name)} ${constraint.type} ${constraint.definition}`;
      });
    }

    sql += '\n)';

    return sql;
  }

  private generateAlterTableQuery(query: VisualQuery): string {
    // This would be implemented based on specific alter operations
    return 'ALTER TABLE implementation would go here';
  }

  private generateSelectColumn(col: SelectedColumn): string {
    let result = '';

    if (col.isExpression && col.expression) {
      result = col.expression;
    } else {
      if (col.aggregateFunction) {
        result = `${col.aggregateFunction}(`;
        if (col.aggregateFunction === 'COUNT' && col.column === '*') {
          result += '*';
        } else {
          result += col.table ? `${this.escapeIdentifier(col.table)}.${this.escapeIdentifier(col.column)}` : this.escapeIdentifier(col.column);
        }
        result += ')';
      } else {
        result = col.table ? `${this.escapeIdentifier(col.table)}.${this.escapeIdentifier(col.column)}` : this.escapeIdentifier(col.column);
      }
    }

    if (col.alias) {
      result += ` AS ${this.escapeIdentifier(col.alias)}`;
    }

    return result;
  }

  private generateFromClause(table: QueryTable): string {
    let result = this.escapeIdentifier(table.name);
    if (table.alias) {
      result += ` AS ${this.escapeIdentifier(table.alias)}`;
    }
    return result;
  }

  private generateJoin(join: QueryJoin, tables: QueryTable[]): string {
    const leftTable = tables.find(t => t.id === join.leftTable);
    const rightTable = tables.find(t => t.id === join.rightTable);
    
    if (!leftTable || !rightTable) {
      throw new Error('Join references invalid tables');
    }

    let sql = `${join.type} JOIN ${this.escapeIdentifier(rightTable.name)}`;
    if (rightTable.alias) {
      sql += ` AS ${this.escapeIdentifier(rightTable.alias)}`;
    }
    
    sql += ' ON ';
    
    const conditions = join.conditions.map(cond => {
      const leftTableName = leftTable.alias || leftTable.name;
      const rightTableName = rightTable.alias || rightTable.name;
      return `${this.escapeIdentifier(leftTableName)}.${this.escapeIdentifier(cond.leftColumn)} ${cond.operator} ${this.escapeIdentifier(rightTableName)}.${this.escapeIdentifier(cond.rightColumn)}`;
    });
    
    sql += conditions.join(' AND ');
    
    return sql;
  }

  private generateWhereClause(conditions: WhereCondition[]): string {
    if (conditions.length === 0) return '';

    let result = '';
    let groupLevel = 0;

    conditions.forEach((condition, index) => {
      if (index > 0 && condition.logicalOperator) {
        result += ` ${condition.logicalOperator} `;
      }

      if (condition.groupStart) {
        result += '(';
        groupLevel++;
      }

      if (condition.isSubquery && condition.subquery) {
        const subquerySQL = this.generateSelectQuery(condition.subquery);
        result += `${this.escapeIdentifier(condition.column)} ${condition.operator} (${subquerySQL})`;
      } else {
        result += this.generateCondition(condition);
      }

      if (condition.groupEnd) {
        result += ')';
        groupLevel--;
      }
    });

    return result;
  }

  private generateCondition(condition: WhereCondition): string {
    const column = this.escapeIdentifier(condition.column);
    
    switch (condition.operator) {
      case 'IS NULL':
        return `${column} IS NULL`;
      case 'IS NOT NULL':
        return `${column} IS NOT NULL`;
      case 'IN':
      case 'NOT IN':
        if (Array.isArray(condition.value)) {
          const values = condition.value.map(v => this.formatValue(v)).join(', ');
          return `${column} ${condition.operator} (${values})`;
        }
        return `${column} ${condition.operator} (${this.formatValue(condition.value)})`;
      case 'BETWEEN':
        return `${column} BETWEEN ${this.formatValue(condition.value)} AND ${this.formatValue(condition.value2)}`;
      default:
        return `${column} ${condition.operator} ${this.formatValue(condition.value)}`;
    }
  }

  private generateOrderByColumn(col: OrderByColumn): string {
    let result = this.escapeIdentifier(col.column) + ' ' + col.direction;
    if (col.nullsFirst !== undefined) {
      result += col.nullsFirst ? ' NULLS FIRST' : ' NULLS LAST';
    }
    return result;
  }

  private generateLimitClause(limit: number, offset?: number): string {
    switch (this.dialect) {
      case 'mysql':
      case 'postgresql':
      case 'sqlite':
        let clause = `\nLIMIT ${limit}`;
        if (offset) {
          clause += ` OFFSET ${offset}`;
        }
        return clause;
      case 'mssql':
        if (offset) {
          return `\nOFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
        } else {
          return `\nTOP ${limit}`;
        }
      case 'oracle':
        if (offset) {
          return `\nOFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
        } else {
          return `\nROWNUM <= ${limit}`;
        }
      default:
        return `\nLIMIT ${limit}`;
    }
  }

  private generateCTEs(ctes: CTE[]): string {
    const cteStrings = ctes.map(cte => {
      let result = `${this.escapeIdentifier(cte.name)}`;
      if (cte.columns) {
        result += ` (${cte.columns.map(col => this.escapeIdentifier(col)).join(', ')})`;
      }
      result += ` AS (\n${this.generateSelectQuery(cte.query)}\n)`;
      return result;
    });

    return `WITH ${cteStrings.join(',\n')}`;
  }

  private generateWindowFunction(wf: WindowFunction): string {
    let result = `${wf.function}(`;
    
    if (wf.column) {
      result += this.escapeIdentifier(wf.column);
    }
    
    result += `) OVER (`;
    
    if (wf.partitionBy && wf.partitionBy.length > 0) {
      result += `PARTITION BY ${wf.partitionBy.map(col => this.escapeIdentifier(col)).join(', ')}`;
    }
    
    if (wf.orderBy && wf.orderBy.length > 0) {
      if (wf.partitionBy && wf.partitionBy.length > 0) {
        result += ' ';
      }
      result += `ORDER BY ${wf.orderBy.map(col => this.generateOrderByColumn(col)).join(', ')}`;
    }
    
    // Frame specification
    if (wf.frameStart !== undefined || wf.frameEnd !== undefined) {
      result += ' ROWS BETWEEN ';
      result += wf.frameStart === 'UNBOUNDED_PRECEDING' ? 'UNBOUNDED PRECEDING' : 
                wf.frameStart === 'CURRENT_ROW' ? 'CURRENT ROW' :
                `${wf.frameStart} PRECEDING`;
      result += ' AND ';
      result += wf.frameEnd === 'UNBOUNDED_FOLLOWING' ? 'UNBOUNDED FOLLOWING' :
                wf.frameEnd === 'CURRENT_ROW' ? 'CURRENT ROW' :
                `${wf.frameEnd} FOLLOWING`;
    }
    
    result += `)`;
    
    if (wf.alias) {
      result += ` AS ${this.escapeIdentifier(wf.alias)}`;
    }
    
    return result;
  }

  private generateUnion(union: UnionOperation): string {
    return `\n${union.type}\n${this.generateSelectQuery(union.query)}`;
  }

  private escapeIdentifier(identifier: string): string {
    switch (this.dialect) {
      case 'mysql':
        return `\`${identifier}\``;
      case 'postgresql':
      case 'sqlite':
        return `"${identifier}"`;
      case 'mssql':
        return `[${identifier}]`;
      case 'oracle':
        return `"${identifier.toUpperCase()}"`;
      default:
        return identifier;
    }
  }

  private formatValue(value: unknown): string {
    if (value === null) {
      return 'NULL';
    }
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }
    if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE';
    }
    if (value instanceof Date) {
      return `'${value.toISOString()}'`;
    }
    return String(value);
  }

  generateExplainSQL(query: VisualQuery): string {
    const sql = this.generateSQL(query);
    
    switch (this.dialect) {
      case 'mysql':
      case 'postgresql':
        return `EXPLAIN ANALYZE ${sql}`;
      case 'sqlite':
        return `EXPLAIN QUERY PLAN ${sql}`;
      case 'mssql':
        return `SET SHOWPLAN_ALL ON\n${sql}`;
      case 'oracle':
        return `EXPLAIN PLAN FOR ${sql}`;
      default:
        return `EXPLAIN ${sql}`;
    }
  }

  generateReadableExplanation(query: VisualQuery): string {
    const parts = [];
    
    switch (query.type) {
      case 'SELECT':
        parts.push('Retrieve data');
        if (query.selectColumns.length > 0) {
          const columns = query.selectColumns.map(col => 
            col.alias ? `${col.column} (as ${col.alias})` : col.column
          ).join(', ');
          parts.push(`columns: ${columns}`);
        } else {
          parts.push('all columns');
        }
        
        if (query.tables.length > 0) {
          parts.push(`from table: ${query.tables[0].name}`);
        }
        
        if (query.joins.length > 0) {
          const joinDesc = query.joins.map(join => 
            `${join.type} join with ${join.rightTable}`
          ).join(', ');
          parts.push(`with ${joinDesc}`);
        }
        
        if (query.whereConditions.length > 0) {
          parts.push(`filtered by ${query.whereConditions.length} condition(s)`);
        }
        
        if (query.groupByColumns.length > 0) {
          parts.push(`grouped by: ${query.groupByColumns.join(', ')}`);
        }
        
        if (query.orderByColumns.length > 0) {
          const orderDesc = query.orderByColumns.map(col => 
            `${col.column} ${col.direction}`
          ).join(', ');
          parts.push(`ordered by: ${orderDesc}`);
        }
        
        if (query.limit) {
          parts.push(`limited to ${query.limit} rows`);
        }
        break;
        
      case 'INSERT':
        parts.push(`Insert data into ${query.tables[0]?.name || 'table'}`);
        if (query.insertData) {
          parts.push(`${query.insertData.values.length} row(s)`);
          parts.push(`columns: ${query.insertData.columns.join(', ')}`);
        }
        break;
        
      case 'UPDATE':
        parts.push(`Update data in ${query.tables[0]?.name || 'table'}`);
        if (query.updateData) {
          parts.push(`set ${query.updateData.setClause.length} column(s)`);
        }
        if (query.whereConditions.length > 0) {
          parts.push(`where ${query.whereConditions.length} condition(s) match`);
        }
        break;
        
      case 'DELETE':
        parts.push(`Delete data from ${query.tables[0]?.name || 'table'}`);
        if (query.whereConditions.length > 0) {
          parts.push(`where ${query.whereConditions.length} condition(s) match`);
        } else {
          parts.push('(all rows - be careful!)');
        }
        break;
        
      case 'CREATE_TABLE':
        if (query.createTableData) {
          parts.push(`Create table ${query.createTableData.tableName}`);
          parts.push(`with ${query.createTableData.columns.length} columns`);
        }
        break;
    }
    
    return parts.join(' ');
  }
}

export const createQueryGenerator = (dialect: string) => {
  return new VisualQueryGenerator(dialect);
};