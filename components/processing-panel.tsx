"use client";

import { useState } from "react";
import { Settings, Play, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ProcessingOptions } from "@/lib/types";

interface ProcessingPanelProps {
  onProcess: (options: ProcessingOptions) => void;
  disabled?: boolean;
  fileCount: number;
}

export function ProcessingPanel({
  onProcess,
  disabled = false,
  fileCount,
}: ProcessingPanelProps) {
  const [textsToRemove, setTextsToRemove] = useState<string[]>([
    "-Photoroom",
    "-edited",
  ]);
  const [processType, setProcessType] =
    useState<ProcessingOptions["processType"]>("both");
  const [newText, setNewText] = useState("");

  const addTextToRemove = () => {
    if (newText.trim() && !textsToRemove.includes(newText.trim())) {
      setTextsToRemove((prev) => [...prev, newText.trim()]);
      setNewText("");
    }
  };

  const removeText = (index: number) => {
    setTextsToRemove((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProcess = () => {
    onProcess({
      textsToRemove,
      processType,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTextToRemove();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Processing Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Process Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Processing Type</Label>
          <RadioGroup
            value={processType}
            onValueChange={(value) => setProcessType(value as ProcessingOptions['processType'])}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="remove-text" id="remove-text" />
              <Label htmlFor="remove-text" className="text-sm">Remove text only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="kebab-case" id="kebab-case" />
              <Label htmlFor="kebab-case" className="text-sm">Kebab-case only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="both" />
              <Label htmlFor="both" className="text-sm">Both (recommended)</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Text Removal */}
        {(processType === "remove-text" || processType === "both") && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Text to Remove</Label>

            {/* Current texts */}
            <div className="flex flex-wrap gap-2">
              {textsToRemove.map((text, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-gray-100 rounded-md px-2 py-1 text-sm"
                >
                  <span>&apos;{text}&apos;</span>
                  <button
                    onClick={() => removeText(index)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new text */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter text to remove..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={addTextToRemove} variant="outline" size="sm">
                Add
              </Button>
            </div>
          </div>
        )}

        {/* Example */}
        <div className="bg-gray-50 rounded-md p-3 text-sm">
          <div className="font-medium text-gray-700 mb-1">Example:</div>
          <div className="text-gray-600">
            <div>Input: &apos;My Photo-Photoroom-edited.png&apos;</div>
            <div>Output: &apos;my-photo.png&apos;</div>
          </div>
        </div>

        {/* Process Button */}
        <Button
          onClick={handleProcess}
          disabled={disabled || fileCount === 0}
          className="w-full"
          size="lg"
        >
          <Play className="h-4 w-4 mr-2" />
          Process {fileCount > 0 ? `${fileCount} Files` : "Files"}
        </Button>
      </CardContent>
    </Card>
  );
}
