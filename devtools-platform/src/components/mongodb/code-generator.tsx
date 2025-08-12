'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, copyToClipboard } from '@/lib/utils';
import { generateMongoCode } from '@/lib/mongodb-utils';
import {
  Code,
  Copy,
  Download,
  Share,
  Eye,
  FileText,
  Terminal,
  Globe,
  Coffee,
  Hash,
  Zap
} from 'lucide-react';
import type { MongoQuery } from '@/types';

interface CodeGeneratorProps {
  query: MongoQuery;
  className?: string;
}

const CODE_LANGUAGES = [
  { 
    id: 'shell', 
    name: 'MongoDB Shell', 
    icon: Terminal, 
    ext: 'js',
    description: 'Native MongoDB shell syntax',
    color: 'text-green-600'
  },
  { 
    id: 'nodejs', 
    name: 'Node.js', 
    icon: Zap, 
    ext: 'js',
    description: 'JavaScript with MongoDB driver',
    color: 'text-yellow-600'
  },
  { 
    id: 'python', 
    name: 'Python', 
    icon: Hash, 
    ext: 'py',
    description: 'Python with PyMongo',
    color: 'text-blue-600'
  },
  { 
    id: 'java', 
    name: 'Java', 
    icon: Coffee, 
    ext: 'java',
    description: 'Java with MongoDB driver',
    color: 'text-orange-600'
  },
  { 
    id: 'csharp', 
    name: 'C#', 
    icon: Hash, 
    ext: 'cs',
    description: 'C# with MongoDB.Driver',
    color: 'text-purple-600'
  },
  { 
    id: 'php', 
    name: 'PHP', 
    ext: 'php',
    description: 'PHP with MongoDB extension',
    color: 'text-indigo-600'
  },
  {
    id: 'rust',
    name: 'Rust',
    ext: 'rs',
    description: 'Rust with mongodb crate',
    color: 'text-red-600'
  },
  {
    id: 'go',
    name: 'Go',
    ext: 'go',
    description: 'Go with official MongoDB driver',
    color: 'text-cyan-600'
  }
];

const FRAMEWORK_TEMPLATES = {
  nodejs: [
    { name: 'Mongoose', framework: 'mongoose' },
    { name: 'Native Driver', framework: 'native' },
    { name: 'Express.js', framework: 'express' },
    { name: 'Next.js API', framework: 'nextjs' }
  ],
  python: [
    { name: 'PyMongo', framework: 'pymongo' },
    { name: 'Motor (Async)', framework: 'motor' },
    { name: 'MongoEngine', framework: 'mongoengine' },
    { name: 'FastAPI', framework: 'fastapi' }
  ],
  java: [
    { name: 'MongoDB Driver', framework: 'driver' },
    { name: 'Spring Data', framework: 'spring' },
    { name: 'Morphia', framework: 'morphia' }
  ]
};

export default function CodeGenerator({ query, className }: CodeGeneratorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('shell');
  const [selectedFramework, setSelectedFramework] = useState('native');
  const [generatedCode, setGeneratedCode] = useState<Record<string, string>>({});
  const [codeStats, setCodeStats] = useState<Record<string, any>>({});
  const [showComments, setShowComments] = useState(true);
  const [showErrorHandling, setShowErrorHandling] = useState(true);
  const [optimizeForProduction, setOptimizeForProduction] = useState(false);

  useEffect(() => {
    generateAllCode();
  }, [query, showComments, showErrorHandling, optimizeForProduction]);

  const generateAllCode = () => {
    const codes: Record<string, string> = {};
    const stats: Record<string, any> = {};

    CODE_LANGUAGES.forEach(lang => {
      const options = {
        comments: showComments,
        errorHandling: showErrorHandling,
        production: optimizeForProduction,
        framework: selectedFramework
      };
      
      codes[lang.id] = generateEnhancedCode(query, lang.id, options);
      stats[lang.id] = {
        lines: codes[lang.id].split('\n').length,
        characters: codes[lang.id].length,
        complexity: calculateComplexity(codes[lang.id])
      };
    });

    setGeneratedCode(codes);
    setCodeStats(stats);
  };

  const generateEnhancedCode = (query: MongoQuery, language: string, options: any): string => {
    // Use existing generator as base and enhance
    let baseCode = generateMongoCode(query, language);
    
    // Add enhancements based on language
    switch (language) {
      case 'nodejs':
        return generateEnhancedNodeJS(query, options);
      case 'python':
        return generateEnhancedPython(query, options);
      case 'java':
        return generateEnhancedJava(query, options);
      case 'csharp':
        return generateEnhancedCSharp(query, options);
      case 'rust':
        return generateRustCode(query, options);
      case 'go':
        return generateGoCode(query, options);
      default:
        return baseCode;
    }
  };

  const generateEnhancedNodeJS = (query: MongoQuery, options: any): string => {
    const { operation, collection, filter, pipeline, document } = query;
    
    let code = '';
    
    if (options.comments) {
      code += `// Enhanced Node.js MongoDB Query\n// Generated on ${new Date().toISOString()}\n\n`;
    }

    if (options.framework === 'mongoose') {
      code += `const mongoose = require('mongoose');\n\n`;
      code += `// Define schema if needed\nconst schema = new mongoose.Schema({\n  // Define your schema here\n});\n`;
      code += `const ${collection.charAt(0).toUpperCase() + collection.slice(1)} = mongoose.model('${collection}', schema);\n\n`;
    } else {
      code += `const { MongoClient } = require('mongodb');\n\n`;
    }

    if (options.errorHandling) {
      code += `async function execute${operation.charAt(0).toUpperCase() + operation.slice(1)}Query() {\n`;
      code += `  try {\n`;
    }

    if (options.framework === 'mongoose') {
      // Mongoose-specific code
      switch (operation) {
        case 'find':
          code += `    const result = await ${collection.charAt(0).toUpperCase() + collection.slice(1)}.find(`;
          if (filter && filter.conditions.length > 0) {
            code += JSON.stringify(buildFilterFromConditions(filter), null, 6);
          } else {
            code += '{}';
          }
          code += ');\n';
          break;
        case 'aggregate':
          if (pipeline && pipeline.length > 0) {
            code += `    const result = await ${collection.charAt(0).toUpperCase() + collection.slice(1)}.aggregate([\n`;
            pipeline.filter(s => s.enabled).forEach((stage, i) => {
              code += `      { ${stage.stage}: ${JSON.stringify(stage.config, null, 8)} }${i < pipeline.length - 1 ? ',' : ''}\n`;
            });
            code += `    ]);\n`;
          }
          break;
      }
    } else {
      // Native driver code
      code += `    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');\n`;
      code += `    await client.connect();\n`;
      code += `    const db = client.db(process.env.DB_NAME || 'database');\n`;
      code += `    const collection = db.collection('${collection}');\n\n`;

      switch (operation) {
        case 'find':
          code += `    const result = await collection.find(`;
          if (filter && filter.conditions.length > 0) {
            code += JSON.stringify(buildFilterFromConditions(filter), null, 6);
          } else {
            code += '{}';
          }
          code += ').toArray();\n';
          break;
        case 'aggregate':
          if (pipeline && pipeline.length > 0) {
            code += `    const result = await collection.aggregate([\n`;
            pipeline.filter(s => s.enabled).forEach((stage, i) => {
              code += `      { ${stage.stage}: ${JSON.stringify(stage.config, null, 8)} }${i < pipeline.length - 1 ? ',' : ''}\n`;
            });
            code += `    ]).toArray();\n`;
          }
          break;
        case 'insertOne':
          code += `    const result = await collection.insertOne(${JSON.stringify(document, null, 4)});\n`;
          break;
      }

      code += `\n    await client.close();\n`;
    }

    code += `    console.log('Result:', result);\n`;
    code += `    return result;\n`;

    if (options.errorHandling) {
      code += `  } catch (error) {\n`;
      code += `    console.error('MongoDB operation failed:', error);\n`;
      code += `    throw error;\n`;
      code += `  }\n`;
      code += `}\n\n`;
      code += `// Execute the query\nexecute${operation.charAt(0).toUpperCase() + operation.slice(1)}Query();`;
    }

    return code;
  };

  const generateEnhancedPython = (query: MongoQuery, options: any): string => {
    const { operation, collection, filter, pipeline } = query;
    
    let code = '';
    
    if (options.comments) {
      code += `# Enhanced Python MongoDB Query\n# Generated on ${new Date().toISOString()}\n\n`;
    }

    if (options.framework === 'motor') {
      code += `import asyncio\nfrom motor.motor_asyncio import AsyncIOMotorClient\n\n`;
    } else {
      code += `from pymongo import MongoClient\nfrom datetime import datetime\nimport os\n\n`;
    }

    if (options.errorHandling) {
      if (options.framework === 'motor') {
        code += `async def execute_${operation}_query():\n`;
      } else {
        code += `def execute_${operation}_query():\n`;
      }
      code += `    try:\n`;
    }

    if (options.framework === 'motor') {
      code += `        client = AsyncIOMotorClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017'))\n`;
      code += `        db = client[os.getenv('DB_NAME', 'database')]\n`;
      code += `        collection = db.${collection}\n\n`;

      switch (operation) {
        case 'find':
          code += `        cursor = collection.find(`;
          if (filter && filter.conditions.length > 0) {
            code += JSON.stringify(buildFilterFromConditions(filter), null, 8).replace(/"/g, "'");
          } else {
            code += '{}';
          }
          code += `)\n`;
          code += `        result = await cursor.to_list(length=None)\n`;
          break;
        case 'aggregate':
          if (pipeline && pipeline.length > 0) {
            code += `        pipeline = [\n`;
            pipeline.filter(s => s.enabled).forEach(stage => {
              code += `            {${stage.stage}: ${JSON.stringify(stage.config, null, 12).replace(/"/g, "'")}},\n`;
            });
            code += `        ]\n`;
            code += `        cursor = collection.aggregate(pipeline)\n`;
            code += `        result = await cursor.to_list(length=None)\n`;
          }
          break;
      }
    } else {
      code += `        client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017'))\n`;
      code += `        db = client[os.getenv('DB_NAME', 'database')]\n`;
      code += `        collection = db.${collection}\n\n`;

      // Standard PyMongo code similar to existing implementation
    }

    code += `        print(f"Found {len(result)} documents")\n`;
    code += `        return result\n`;

    if (options.errorHandling) {
      code += `    except Exception as error:\n`;
      code += `        print(f"MongoDB operation failed: {error}")\n`;
      code += `        raise\n`;
      code += `    finally:\n`;
      code += `        client.close()\n\n`;
    }

    if (options.framework === 'motor') {
      code += `# Run the async query\nif __name__ == "__main__":\n    asyncio.run(execute_${operation}_query())`;
    } else {
      code += `# Execute the query\nif __name__ == "__main__":\n    execute_${operation}_query()`;
    }

    return code;
  };

  const generateRustCode = (query: MongoQuery, options: any): string => {
    const { operation, collection } = query;
    
    let code = '';
    
    if (options.comments) {
      code += `// Rust MongoDB Query\n// Add to Cargo.toml: mongodb = "2.0"\n\n`;
    }

    code += `use mongodb::{\n    bson::doc,\n    Client, Collection,\n    error::Result,\n};\nuse tokio;\n\n`;
    
    code += `#[tokio::main]\nasync fn main() -> Result<()> {\n`;
    code += `    let client = Client::with_uri_str("mongodb://localhost:27017").await?;\n`;
    code += `    let db = client.database("database");\n`;
    code += `    let collection: Collection<mongodb::bson::Document> = db.collection("${collection}");\n\n`;

    switch (operation) {
      case 'find':
        code += `    let cursor = collection.find(doc! {}, None).await?;\n`;
        code += `    let results: Vec<_> = cursor.try_collect().await?;\n`;
        break;
      case 'insertOne':
        code += `    let doc = doc! {\n        "field": "value"\n    };\n`;
        code += `    let result = collection.insert_one(doc, None).await?;\n`;
        break;
    }

    code += `    println!("Operation completed successfully");\n    Ok(())\n}`;

    return code;
  };

  const generateGoCode = (query: MongoQuery, options: any): string => {
    const { operation, collection } = query;
    
    let code = '';
    
    if (options.comments) {
      code += `// Go MongoDB Query\n// go get go.mongodb.org/mongo-driver/mongo\n\n`;
    }

    code += `package main\n\n`;
    code += `import (\n    "context"\n    "fmt"\n    "log"\n\n    "go.mongodb.org/mongo-driver/mongo"\n    "go.mongodb.org/mongo-driver/mongo/options"\n    "go.mongodb.org/mongo-driver/bson"\n)\n\n`;
    
    code += `func main() {\n`;
    code += `    client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI("mongodb://localhost:27017"))\n`;
    code += `    if err != nil {\n        log.Fatal(err)\n    }\n`;
    code += `    defer client.Disconnect(context.TODO())\n\n`;
    code += `    collection := client.Database("database").Collection("${collection}")\n\n`;

    switch (operation) {
      case 'find':
        code += `    cursor, err := collection.Find(context.TODO(), bson.D{{}})\n`;
        code += `    if err != nil {\n        log.Fatal(err)\n    }\n`;
        code += `    defer cursor.Close(context.TODO())\n\n`;
        code += `    for cursor.Next(context.TODO()) {\n        var result bson.M\n        cursor.Decode(&result)\n        fmt.Println(result)\n    }\n`;
        break;
    }

    code += `}`;

    return code;
  };

  // Helper functions
  const buildFilterFromConditions = (filter: any): any => {
    // Simplified version - in real implementation, would use the existing filter builder logic
    return {};
  };

  const generateEnhancedJava = (query: MongoQuery, options: any): string => {
    return generateMongoCode(query, 'java'); // Use existing for now
  };

  const generateEnhancedCSharp = (query: MongoQuery, options: any): string => {
    return generateMongoCode(query, 'csharp'); // Use existing for now
  };

  const calculateComplexity = (code: string): 'Low' | 'Medium' | 'High' => {
    const lines = code.split('\n').length;
    if (lines < 20) return 'Low';
    if (lines < 50) return 'Medium';
    return 'High';
  };

  const handleDownload = (language: string) => {
    const lang = CODE_LANGUAGES.find(l => l.id === language);
    const code = generatedCode[language];
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mongodb-query.${lang?.ext || 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code Generator
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={showComments ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowComments(!showComments)}
            >
              Comments
            </Button>
            <Button
              variant={showErrorHandling ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowErrorHandling(!showErrorHandling)}
            >
              Error Handling
            </Button>
            <Button
              variant={optimizeForProduction ? "default" : "ghost"}
              size="sm"
              onClick={() => setOptimizeForProduction(!optimizeForProduction)}
            >
              Production
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-4">
            {CODE_LANGUAGES.map(lang => {
              const Icon = lang.icon || Code;
              return (
                <TabsTrigger key={lang.id} value={lang.id} className="text-xs">
                  <Icon className="h-3 w-3 mr-1" />
                  {lang.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {CODE_LANGUAGES.map(lang => (
            <TabsContent key={lang.id} value={lang.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={lang.color}>
                    {lang.name}
                  </Badge>
                  {codeStats[lang.id] && (
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span>{codeStats[lang.id].lines} lines</span>
                      <span>•</span>
                      <span>{codeStats[lang.id].characters} chars</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        {codeStats[lang.id].complexity}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedCode[lang.id] || '')}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(lang.id)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>

              {lang.description && (
                <p className="text-sm text-muted-foreground">{lang.description}</p>
              )}

              {/* Framework Selection for supported languages */}
              {FRAMEWORK_TEMPLATES[lang.id as keyof typeof FRAMEWORK_TEMPLATES] && (
                <div className="flex gap-2 mb-2">
                  <span className="text-sm font-medium">Framework:</span>
                  {FRAMEWORK_TEMPLATES[lang.id as keyof typeof FRAMEWORK_TEMPLATES].map(framework => (
                    <Button
                      key={framework.framework}
                      variant={selectedFramework === framework.framework ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedFramework(framework.framework)}
                    >
                      {framework.name}
                    </Button>
                  ))}
                </div>
              )}

              <Textarea
                value={generatedCode[lang.id] || ''}
                readOnly
                className="font-mono text-sm bg-muted min-h-[400px]"
                style={{ fontSize: '13px', lineHeight: '1.4' }}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}