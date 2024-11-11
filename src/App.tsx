/**
 * @fileoverview Unserious Cookie Manager (CM) Chrome Extension
 * @author John Paul Caigas (mra1k3r0) <github.com/mra1k3r0>
 *
 * A delightfully whimsical cookie manager that brings a touch of fun to browser cookie management.
 * Built with React, TypeScript, and a sprinkle of humor, this extension makes cookie management
 * less of a chore and more of a treat. Features include cookie viewing, setting, and deletion
 * with a playful baking theme throughout the interface.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Textarea } from './components/ui/textarea';
// import { Input } from './components/ui/input';
// import { Checkbox } from './components/ui/checkbox';
// import { Label } from './components/ui/label';
import {
  Copy,
  ClipboardPaste,
  Trash2,
  ExternalLink,
  Cookie,
  RefreshCw,
  Download,
  Upload,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useToast, Toaster } from './components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './components/ui/table';

type Cookie = {
  name: string;
  value: string;
};

const tabVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
};

export default function Component() {
  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [cookieString, setCookieString] = useState('');
  const [inputCookies, setInputCookies] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('view');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCookies();
  }, []);

  /**
   * Loads cookies from the current tab via Chrome extension API
   * Handles error cases and updates both the cookie array and string representation
   * @returns {void}
   */
  const loadCookies = () => {
    const message = { action: 'getCookies' };

    chrome.runtime.sendMessage(message, (response: Cookie[] | { error: string }) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load cookies. Did they crumble?',
        });
        return;
      }

      if ('error' in response) {
        console.error(response.error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error,
        });
        return;
      }

      setCookies(response);
      const cookieString = response.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
      setCookieString(cookieString);
    });
  };

  /**
   * Refreshes the cookie list and displays a success toast
   * @returns {void}
   */
  const handleRefreshCookies = () => {
    loadCookies();
    toast({
      variant: 'success',
      title: 'Cookies Refreshed',
      description: "We've checked the cookie jar for fresh ones!",
    });
  };

  /**
   * Handles the cookie setting process
   * Validates input, sends message to background script, and handles response
   * @param {React.FormEvent} e - The form submission event
   * @returns {void}
   */
  const handleSetCookies = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCookies.trim()) {
      toast({
        variant: 'destructive',
        title: 'Empty Cookie Jar',
        description: "You can't bake cookies without ingredients! Please add some cookie data.",
      });
      return;
    }
    const message = { action: 'setCookies', cookies: inputCookies };

    chrome.runtime.sendMessage(message, (response: { success: boolean; error?: string }) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        toast({
          variant: 'destructive',
          title: 'Cookie Setting Failed',
          description: "Oops! We couldn't set the cookies. Maybe they're too crunchy?",
        });
        return;
      }
      if (response.success) {
        toast({
          variant: 'success',
          title: 'Cookies Set Successfully',
          description: 'Your new cookies are baked and ready to go!',
        });
        loadCookies();
        setInputCookies('');
      } else {
        toast({
          variant: 'destructive',
          title: 'Cookie Setting Failed',
          description:
            response.error || 'Something went wrong. Did you forget the secret ingredient?',
        });
      }
    });
  };

  /**
   * Deletes all cookies for the current tab
   * @returns {void}
   */
  const handleDeleteAllCookies = () => {
    const message = { action: 'deleteAllCookies' };

    chrome.runtime.sendMessage(message, (response: { success: boolean; error?: string }) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        toast({
          variant: 'destructive',
          title: 'Cookie Deletion Failed',
          description: "We couldn't clear the cookies. They're putting up a fight!",
        });
        return;
      }
      if (response.success) {
        toast({
          variant: 'success',
          title: 'Cookies Cleared',
          description: 'All cookies have been eaten... err, deleted successfully!',
        });
        loadCookies();
      } else {
        toast({
          variant: 'destructive',
          title: 'Cookie Deletion Failed',
          description:
            response.error || 'Something went wrong. The cookie monster might be involved.',
        });
      }
    });
  };

  /**
   * Copies the current cookie string to clipboard
   * @returns {Promise<void>}
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cookieString);
      toast({
        variant: 'success',
        title: 'Cookies Copied',
        description: "Cookie recipe is now in your clipboard! Don't eat it!",
      });
    } catch (err) {
      console.error('Failed to copy cookies: ', err);
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: "We couldn't copy the cookies. They're too delicious to duplicate!",
      });
    }
  };

  /**
   * Pastes clipboard content into the input cookies textarea
   * @returns {Promise<void>}
   */
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputCookies(text);
      toast({
        variant: 'success',
        title: 'Cookies Pasted',
        description: 'Cookie dough has been pasted from your clipboard. Ready to bake!',
      });
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      toast({
        variant: 'destructive',
        title: 'Paste Failed',
        description: "We couldn't paste from the clipboard. Is it covered in cookie crumbs?",
      });
    }
  };

  /**
   * Downloads the current cookie string as a text file
   * @returns {void}
   */
  const handleDownload = () => {
    const blob = new Blob([cookieString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cookies.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      variant: 'success',
      title: 'Cookies Downloaded',
      description: 'Your cookie recipe has been saved for future baking sessions!',
    });
  };

  /**
   * Handles file upload for importing cookies
   * Reads text file content and updates input state
   * @param {React.ChangeEvent<HTMLInputElement>} event - The file input change event
   * @returns {void}
   */
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const content = e.target?.result as string;
        setInputCookies(content);
        toast({
          variant: 'success',
          title: 'Cookies Imported',
          description: 'Your cookie recipe has been loaded. Ready to bake!',
        });
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Triggers the hidden file input for uploading
   * @returns {void}
   */
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  /**
   * Toggles the expanded state of the extension
   * @returns {void}
   */
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`relative ${isExpanded ? 'w-[600px]' : 'w-[400px]'} transition-all duration-300 ease-in-out p-4 bg-background`}
    >
      <Button
        variant="outline"
        size="icon"
        className="absolute -left-6 top-1/2 transform -translate-y-1/2"
        onClick={toggleExpand}
        aria-label={isExpanded ? 'Collapse extension' : 'Expand extension'}
      >
        {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>
      <h1 className="text-2xl font-bold mb-4 flex items-center">
        <Cookie className="mr-2 h-6 w-6" />
        Unserious CM
      </h1>
      <Tabs defaultValue="view" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 p-1 bg-muted rounded-lg">
          <TabsTrigger
            value="view"
            className="px-3 py-2 rounded-md transition-all duration-200 ease-in-out hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative overflow-hidden"
          >
            <span className="relative z-10">View Cookies</span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-foreground transform origin-left scale-x-0 transition-transform duration-200 data-[state=active]:scale-x-100"></span>
          </TabsTrigger>
          <TabsTrigger
            value="set"
            className="px-3 py-2 rounded-md transition-all duration-200 ease-in-out hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative overflow-hidden"
          >
            <span className="relative z-10">Set Cookies</span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-foreground transform origin-left scale-x-0 transition-transform duration-200 data-[state=active]:scale-x-100"></span>
          </TabsTrigger>
          <TabsTrigger
            value="table"
            className="px-3 py-2 rounded-md transition-all duration-200 ease-in-out hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative overflow-hidden"
          >
            <span className="relative z-10">Cookie Jar</span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-foreground transform origin-left scale-x-0 transition-transform duration-200 data-[state=active]:scale-x-100"></span>
          </TabsTrigger>
        </TabsList>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabVariants}
          >
            <TabsContent value="view" className="mt-4">
              <div className="bg-muted p-4 rounded-md flex flex-col h-[300px]">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Current Cookies</h2>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleRefreshCookies}
                      aria-label="Refresh cookies"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopy}
                      aria-label="Copy cookies"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleDownload}
                      aria-label="Download cookies"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-grow overflow-y-auto">
                  <p className="text-sm break-all">
                    {cookieString || 'No cookies found. Did you eat them all?'}
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                className="mt-4 w-full"
                onClick={handleDeleteAllCookies}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eat All Cookies
              </Button>
            </TabsContent>
            <TabsContent value="set" className="mt-4">
              <form onSubmit={handleSetCookies}>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Bake New Cookies</h2>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handlePaste}
                      aria-label="Paste cookies"
                    >
                      <ClipboardPaste className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={triggerFileInput}
                      aria-label="Upload cookies"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleUpload}
                      accept=".txt"
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                <Textarea
                  placeholder="Enter cookie recipe (name=value; name2=value2;)"
                  value={inputCookies}
                  onChange={e => setInputCookies(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button type="submit" className="mt-4 w-full">
                  Bake Cookies
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="table" className="mt-4">
              <div className="bg-muted p-4 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Cookie Jar Contents</h2>
                <div className="max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cookie Name</TableHead>
                        <TableHead>Secret Ingredient</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cookies.map((cookie, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{cookie.name}</TableCell>
                          <TableCell>{cookie.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Baked with love by{' '}
        <a
          href="https://github.com/mra1k3r0"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline inline-flex items-center"
        >
          mra1k3r0
          <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </div>
      <Toaster />
    </div>
  );
}
