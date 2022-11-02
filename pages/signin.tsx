import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { getProviders, signIn, useSession } from "next-auth/react";
import { BuiltInProviderType } from "next-auth/providers";
import { FcGoogle } from "react-icons/fc";
import { FaGraduationCap } from "react-icons/fa";
import styles from "../styles/Auth.module.scss";

const SignIn = (props: { providers: BuiltInProviderType }) => {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) router.push("/");
  }, [session]);

  return (
    <div className={styles.container}>
      {props.providers &&
        Object.values(props.providers).map((provider: any) => (
          <div key={provider.name} className={styles.provider}>
            <div className={styles["logo-container"]}>
              <div className={styles["svg-container"]}>
                <FaGraduationCap size={30} />
              </div>
              <span>courseyard</span>
            </div>
            <button onClick={() => signIn(provider.id)}>
              <FcGoogle size={24} />
              <span>Sign in with {provider.name}</span>
            </button>
          </div>
        ))}
    </div>
  );
};

export default SignIn;

export const getServerSideProps = async () => {
  const providers = await getProviders();
  return {
    props: { providers },
  };
};
