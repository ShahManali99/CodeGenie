"use client";

import { SetStateAction, useState } from "react";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from 'axios';
import * as z from 'zod';
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { Button } from "@/components/ui/button";


const HomePage = () => {
  const [selectedModel, setSelectedModel] = useState("basic");

  const handleModelChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setSelectedModel(event.target.value);
  };

  const router = useRouter();
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt:""
    }
  });

  const isLoading = form.formState.isSubmitting;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
        const userMessage: CreateChatCompletionRequestMessage = {
          role: 'user',
          content: values.prompt,
        };
        const newMessages = [...messages,userMessage];
        const response = await axios.post("/api/home", {
          messages:newMessages,
        });

        setMessages((current) => [...current, userMessage, response.data]);

        form.reset();
    } catch (error: any) {
        console.log(error);
    } finally {
        router.refresh();
    }
  };

  return (
    <div>
      <div>
        <div className="px-4 lg:px-8 flex items-center gap-x-3 mb-8">
          <select
            value={selectedModel}
            onChange={handleModelChange}
            className="border border-gray-300 rounded-md p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-black-500"
          >
            <option value="chatgpt">ChatGpt</option>
            <option value="gemini">Gemini</option>
            <option value="perplexity">Perplexity</option>
            <option value="mistral">Mistral</option>
          </select>
        </div>
      </div>
      <div className="mb-8 space-y-4">
        <h2 className="text-2xl md:text-4xl font-bold text-center">
          Explore the power of AI
        </h2>
      </div>
      <div className='px-4 md:px-20 lg:px-32 space-y-4'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2 items-center"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-10 lg:col-span-11">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="Ask me anything"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="col-span-2 lg:col-span-1 flex justify-end">
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-md p-2 flex justify-center items-center" 
                  disabled={isLoading}>
                  <Send className="w-6 h-6" />
                </Button>
              </div>
            </form>
          </Form>
      </div>

      <div className="space-y-4 mt-4">
        <div className="flex flex-col-reverse gap-y-4">
          {messages.map((message) => (
            <div key={message.content}>
              {message.content}
            </div>
          ))}
        </div>
      </div>
    </div>
    
  )
}
export default HomePage;
