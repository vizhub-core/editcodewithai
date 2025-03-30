import fs from 'fs';
import path from 'path';
import createIgnore from 'ignore';

// Configuration constants
const ignoreFilePattern = '**/{.ignore,.gitignore}';
const baseIgnore = [
  '.git',
  'node_modules',
  'dist',
  '*.log',
  '.DS_Store',
  'coverage',
  '.env',
  '.env.*',
];

const debugIgnore = false;
const debugDirectories = false;
const enableDirectories = true;

/**
 * @param {string} fullPath - absolute path of the workspace root
 * @param {string} currentDirectoryPath - path where the ignore file is found, relative to fullPath
 * @param {string} fileName - name of the ignore file
 * @returns {string[]} parsed lines
 */
const parseIgnoreFile = (
  fullPath: string,
  currentDirectory: string,
  fileName: string,
): string[] => {
  const filePath = path.join(
    fullPath,
    currentDirectory,
    fileName,
  );
  const content = fs.readFileSync(filePath, 'utf8');
  const globs = content
    .split(/[\n\r]+/)
    .filter(
      // remove blank line and comments
      (line) => line.length > 0 && !line.startsWith('#'),
    )
    .map((line) => {
      const { bang, slash, glob } = line.match(
        /^(?<bang>!?)(?<slash>\/?)(?<glob>.*)$/,
      )!.groups!;
      const hasSlash =
        Boolean(slash) || /\/.*\S/.test(glob);
      const relativeGlob = path.posix.join(
        currentDirectory.replace(
          // escape characters with special meaning in glob expressions
          /[*?!# \[\]\\]/g,
          (char) => '\\' + char,
        ),
        // a pattern that doesn't include a slash (not counting a trailing one) matches files in any descendant directory of the current one
        hasSlash ? '' : '**',
        glob,
      );
      // preserve leading `!` and `/` characters
      return bang + slash + relativeGlob;
    });
  if (debugIgnore) {
    console.debug(
      'at',
      currentDirectory,
      'parsing',
      fileName,
      'obtained globs',
      globs,
    );
  }
  return globs;
};

interface InitialDocument {
  files: {
    [key: string]: {
      text: string | null;
      name: string;
    };
  };
}

export const isDirectory = (path: string): boolean => path.endsWith('/');

// Lists files from the file system,
// converts them into the internal data structure.
export const computeInitialDocument = ({ fullPath }: { fullPath: string }): InitialDocument => {
  // Initialize the document using our data structure for representing files.
  const initialDocument: InitialDocument = {
    files: {},
  };

  /**
   * Stack for recursively traversing directories.
   * @type {string[]}
   */
  let files: string[] = [];

  const ignoreFileMatcher = createIgnore().add(ignoreFilePattern);
  const isIgnoreFile = (fileName: string) =>
    ignoreFileMatcher.ignores(fileName);

  const unsearchedDirectories = [
    {
      currentDirectory: '.',
      ignore: createIgnore().add(baseIgnore),
    },
  ];

  while (unsearchedDirectories.length !== 0) {
    const { currentDirectory, ignore: parentIgnore } =
      unsearchedDirectories.pop()!;
    const currentDirectoryPath = path.join(
      fullPath,
      currentDirectory,
    );
    const dirEntries = fs
      .readdirSync(currentDirectoryPath, {
        withFileTypes: true,
      })
      .filter((dirent) =>
        enableDirectories ? true : dirent.isFile(),
      );
    // find .ignore or .gitignore files in the current directory
    const ignoreFiles = dirEntries
      .filter(
        (dirent) =>
          dirent.isFile() && isIgnoreFile(dirent.name),
      )
      .map((file) => file.name);
    let ignore = parentIgnore;
    if (ignoreFiles.length > 0) {
      const globs = ignoreFiles.flatMap((fileName) =>
        parseIgnoreFile(
          fullPath,
          currentDirectory,
          fileName,
        ),
      );
      ignore = createIgnore().add(parentIgnore).add(globs);
    }
    const newFiles = dirEntries
      .filter((dirent) => {
        const relativePath =
          path.posix.join(currentDirectory, dirent.name) +
          (dirent.isDirectory() ? '/' : '');
        const keep = !ignore.ignores(relativePath);
        if (debugIgnore && !keep) {
          console.debug(
            'at',
            currentDirectory,
            'ignoring',
            relativePath,
          );
        }
        return keep;
      })
      // Add a trailing slash for directories
      .map((dirent) => {
        const relativePath = path.posix.join(
          currentDirectory,
          dirent.name,
        );

        if (!dirent.isDirectory()) {
          return relativePath;
        }
        unsearchedDirectories.push({
          currentDirectory: relativePath,
          ignore,
        });
        return relativePath + '/';
      });

    files.push(...newFiles);
  }

  files.forEach((file) => {
    const id = Math.floor(Math.random() * 10000000).toString();
    initialDocument.files[id] = {
      text: isDirectory(file)
        ? null
        : fs.readFileSync(
            path.join(fullPath, file),
            'utf-8',
          ),
      name: file,
    };
  });

  if (debugDirectories) {
    console.log('files:');
    console.log(files);
    console.log('initialDocument:');
    console.log(JSON.stringify(initialDocument, null, 2));
  }
  return initialDocument;
};
