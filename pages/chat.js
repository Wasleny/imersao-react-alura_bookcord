import { Box, Text, TextField, Image, Button } from "@skynexui/components";
import React, { useEffect, useReducer, useState } from "react";
import { IoSend } from "react-icons/io5";
import appConfig from "../config.json";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { ButtonSendSticker } from "../src/components/ButtonSendSticker";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzQ5MTAwMCwiZXhwIjoxOTU5MDY3MDAwfQ.xH5hCLO-tCuSKZMyukqNqfoZwPYbXZTQy-WgtQXkLRw";
const SUPABASE_URL = "https://crqulkfafcijacxmxtut.supabase.co";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const listenMessages = (handleNewMessage) => {
  return supabaseClient
    .from("messages")
    .on("INSERT", (response) => {
      console.log(response);
      handleNewMessage(response.new);
    })
    .subscribe();
};

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [listMessages, setListMessages] = useState([]);
  const route = useRouter();
  const activeUser = route.query.username;

  const onChange = (e) => {
    setMessage(e.target.value);
  };

  const onKeyPress = (e) => {
    if (e.charCode === 13) {
      e.preventDefault();
      handleNewMessage(message);
    }
  };

  const handleNewMessage = (newMessage) => {
    const msg = {
      from: activeUser,
      content: newMessage,
    };

    supabaseClient
      .from("messages")
      .insert([msg])
      .then(({ data }) => {});

    setMessage("");
  };

  useEffect(() => {
    supabaseClient
      .from("messages")
      .select("*")
      .order("id", { ascending: false })
      .then(({ data }) => {
        setListMessages(data);
      });

    listenMessages((newMessage) => {
      setListMessages((currentList) => {
        return [newMessage, ...currentList];
      });
    });
  }, []);

  return (
    <Box
      styleSheet={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: appConfig.theme.colors.primary[500],
        backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/09/old-library.jpg)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundBlendMode: "multiply",
        color: appConfig.theme.colors.neutrals["000"],
      }}
    >
      <Box
        styleSheet={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          boxShadow: "0 2px 10px 0 rgb(0 0 0 / 20%)",
          borderRadius: "5px",
          backgroundColor: appConfig.theme.colors.neutrals[1100],
          height: "100%",
          maxWidth: "95%",
          maxHeight: "95vh",
          padding: "32px",
        }}
      >
        <Header />
        <Box
          styleSheet={{
            position: "relative",
            display: "flex",
            flex: 1,
            height: "80%",
            backgroundColor: appConfig.theme.colors.neutrals[1100],
            flexDirection: "column",
            borderRadius: "5px",
            border: "1px solid",
            borderColor: appConfig.theme.colors.primary[500],
            padding: "16px",
          }}
        >
          <MessageList listMessages={listMessages} />

          <Box
            as="form"
            styleSheet={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <TextField
              value={message}
              onChange={(e) => onChange(e)}
              onKeyPress={(e) => onKeyPress(e)}
              placeholder="Insira sua mensagem aqui..."
              type="textarea"
              styleSheet={{
                width: "100%",
                border: "0",
                resize: "none",
                borderRadius: "5px",
                padding: "6px 8px",
                backgroundColor: appConfig.theme.colors.neutrals[1100],
                marginRight: "12px",
                color: appConfig.theme.colors.neutrals[600],
                border: "1px solid",
                borderColor: appConfig.theme.colors.primary[300],
              }}
            />
            <Button
              onClick={() => (message !== "" ? handleNewMessage(message) : "")}
              label={<IoSend />}
              styleSheet={{
                borderRadius: "5px",
                backgroundColor: "transparent",
                marginRight: "12px",
                color: appConfig.theme.colors.primary[600],
                border: "1px solid",
                hover: {
                  backgroundColor: appConfig.theme.colors.primary[900],
                  color: appConfig.theme.colors.primary[300],
                },
              }}
            />
            <ButtonSendSticker
              onStickerClick={(sticker) => {
                handleNewMessage(":sticker:" + sticker);
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function Header() {
  return (
    <>
      <Box
        styleSheet={{
          width: "100%",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text variant="heading5">CHAT</Text>
        <Button
          variant="tertiary"
          colorVariant="neutral"
          label="SAIR"
          href="/"
        />
      </Box>
    </>
  );
}

function MessageList({ listMessages, handleRemoveMessage }) {
  return (
    <Box
      tag="ul"
      styleSheet={{
        overflowY: "scroll",
        display: "flex",
        flexDirection: "column-reverse",
        flex: 1,
        color: appConfig.theme.colors.neutrals["000"],
        marginBottom: "16px",
      }}
    >
      {listMessages.map((message) => (
        <Text
          key={message.id}
          tag="li"
          styleSheet={{
            borderRadius: "5px",
            padding: "6px",
            marginBottom: "12px",
            hover: {
              backgroundColor: appConfig.theme.colors.neutrals[900],
            },
          }}
        >
          <Box
            styleSheet={{
              marginBottom: "8px",
            }}
          >
            <Image
              styleSheet={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                display: "inline-block",
                marginRight: "8px",
              }}
              src={`https://github.com/${message.from}.png`}
            />
            <Text tag="strong">{message.from}</Text>
            <Text
              styleSheet={{
                fontSize: "10px",
                marginLeft: "8px",
                color: appConfig.theme.colors.neutrals[300],
              }}
              tag="span"
            >
              {new Date().toLocaleDateString()}
            </Text>
          </Box>
          {message.content.startsWith(":sticker:") ? (
            <Image src={message.content.replace(":sticker:", "")} />
          ) : (
            message.content
          )}
        </Text>
      ))}
    </Box>
  );
}
