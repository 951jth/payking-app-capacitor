import type { ActivityComponentType } from "@stackflow/react";
import { AxiosError } from "axios";
import { useState } from "react";
import logoPayking from "../assets/icons/Logo_payking_simple.svg";
import { AppContainer, CSInquiryButton, PKButton, PKInput, PKText } from "../components";
import { useAppNavigation } from "../navigation/useAppNavigation";
import authService from "../service/auth";
import { getResponseToken, type ApiResponse } from "../service/axios";
import { useAlertStore } from "../stores/alertStore";
import { useDeviceStore } from "../stores/deviceStore";
import { useSessionStore } from "../stores/sessionStore";

export const LoginActivity: ActivityComponentType<"login"> = () => {
  const navigation = useAppNavigation();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const showAlert = useAlertStore((state) => state.showAlert);
  const [loggingIn, setLoggingIn] = useState(false);
  const deviceToken = useSessionStore((state) => state.deviceToken);
  const deviceReady = useDeviceStore((state) => state.deviceReady);
  const registerDevice = useDeviceStore((state) => state.registerDevice);
  const setAccessToken = useSessionStore((state) => state.setAccessToken);

  const handleLogin = async () => {
    if (loggingIn) return;

    if (!deviceToken) {
      showAlert({
        title: "로그인 실패",
        contents: "디바이스 인증이 완료된 후 다시 시도해주세요.",
      });
      return;
    }

    setLoggingIn(true);

    try {
      const response = await authService.userLogin({
        "device-token": deviceToken,
        "access-point": "APP",
        username: id,
        password,
      });
      const token = getResponseToken(response.data);

      if (!token) {
        throw new Error("로그인 응답에 token이 없습니다.");
      }

      setAccessToken(token);
      navigation.replace('mainTab', {});
    } catch (error) {
      showAlert({
        title: "로그인 실패",
        contents: getLoginErrorMessage(error),
      });
    } finally {
      setLoggingIn(false);
    }
  };

  const handleRetryDeviceRegistration = () => {
    void registerDevice().catch(() => {
      showAlert({
        title: "디바이스 인증 실패",
        contents: "디바이스 인증 요청에 실패했습니다.",
      });
    });
  };

  return (
    <AppContainer
      bottomChildren={
        <PKButton
          buttonType="standard"
          disabled={!id || !password || !deviceToken}
          loading={loggingIn}
          onClick={handleLogin}
          title="로그인"
        />
      }
      className={classes.screen}
      contentClassName={classes.content}
    >
      <section className={classes.main}>
        <img alt="PayKing" className={classes.logo} src={logoPayking} />

        <div className={classes.copy}>
          <PKText as="p">써본 사람만 알아요.</PKText>
          <PKText as="p">이 편함, 지금 경험해보세요.</PKText>
        </div>

        <div className={classes.form}>
          <PKInput
            aria-label="아이디"
            onChangeText={setId}
            placeholder="아이디"
            type="id"
            value={id}
          />
          <PKInput
            aria-label="비밀번호"
            onChangeText={setPassword}
            placeholder="비밀번호"
            type="password"
            value={password}
          />
        </div>

        {!deviceToken && (
          <div className={classes.deviceStatus}>
            <PKText as="p">
              {deviceReady
                ? "디바이스 인증 토큰을 발급받지 못했습니다."
                : "디바이스 인증을 준비하고 있습니다."}
            </PKText>
            {deviceReady && (
              <PKButton
                buttonType="text"
                className={classes.linkButton}
                onClick={handleRetryDeviceRegistration}
                textClassName={classes.linkButtonText}
                title="재시도"
              />
            )}
          </div>
        )}

        <div className={classes.links}>
          <CSInquiryButton />
          <div className={classes.linkGroup}>
            <PKButton
              buttonType="text"
              className={classes.linkButton}
              onClick={() => navigation.navigate("findId", {})}
              textClassName={classes.linkButtonText}
              title="아이디 찾기"
            />
            <PKText className={classes.linkDivider}>|</PKText>
            <PKButton
              buttonType="text"
              className={classes.linkButton}
              onClick={() => navigation.navigate("findPw", {})}
              textClassName={classes.linkButtonText}
              title="비밀번호 찾기"
            />
          </div>
        </div>
      </section>
    </AppContainer>
  );
};

function getLoginErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const response = error.response?.data as ApiResponse | undefined;
    const systemMessage = response?.meta?.systemMessage;
    const userMessage = response?.meta?.userMessage;

    if (typeof userMessage === "string" && userMessage) return userMessage;
    if (typeof systemMessage === "string" && systemMessage)
      return systemMessage;
  }

  if (error instanceof Error && error.message) return error.message;

  return "서버오류";
}

const classes = {
  screen: "bg-white",
  content:
    "box-border flex min-h-full flex-1 items-center justify-center px-[30px]",
  main: "flex w-full h-full flex-col items-center justify-center",
  logo: "mb-6 block h-20 w-[50px]",
  copy: "mb-[38px] grid gap-2 text-center [&_.pk-text]:m-0 [&_.pk-text]:text-sm [&_.pk-text]:font-normal [&_.pk-text]:text-[var(--pk-text)]",
  form: "mb-3 grid w-full gap-4",
  deviceStatus:
    "mb-3 flex w-full items-center justify-between gap-3 rounded-md bg-[#f6f7f9] px-3 py-2 [&_.pk-text]:m-0 [&_.pk-text]:text-xs [&_.pk-text]:text-[#575e6b]",
  links: "mb-3 flex w-full items-center justify-between px-1",
  linkGroup: "flex items-center gap-3",
  linkButton: "inline-flex h-6 shrink-0 items-center justify-center p-0",
  linkButtonText: "text-xs font-extralight leading-none text-[var(--pk-muted)]",
  linkDivider:
    "inline-flex h-6 shrink-0 items-center m-0 text-xs font-extralight leading-none text-[var(--pk-muted)]",
};
