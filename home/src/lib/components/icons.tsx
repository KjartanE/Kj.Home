// Import all icons
import BashIcon from "./language/bash.svg";
import RustIcon from "./language/rust.svg";
import JsonIcon from "./language/json.svg";
import JavaScriptIcon from "./language/javascript.svg";
import TypeScriptIcon from "./language/typescript.svg";
import CssIcon from "./language/css.svg";
import HtmlIcon from "./language/html.svg";
import CppIcon from "./language/c__.svg";
import PythonIcon from "./language/python.svg";
import CIcon from "./language/c.svg";
import JavaIcon from "./language/java.svg";

import DockerIcon from "./info/docker.svg";
import DiscordIcon from "./info/discord.svg";
import LinkedInIcon from "./info/linkedin.svg";
import SoundCloudIcon from "./info/sound_cloud.svg";
import SpotifyIcon from "./info/spotify.svg";
import GitHubIcon from "./info/github.svg";
import GmailIcon from "./info/gmail.svg";

import OpenShiftIcon from "./deployment/openshift.svg";
import AzureIcon from "./deployment/azure.svg";
import AWSIcon from "./deployment/aws.svg";
import VercelIcon from "./deployment/vercel.svg";
import KubernetesIcon from "./deployment/kubernetes.svg";

import PostmanIcon from "./software/postman.svg";
import GitIcon from "./software/git.svg";
import StackOverflowIcon from "./software/stack_overflow.svg";
import VSCodeIcon from "./software/vs_code.svg";
import SwaggerIcon from "./software/swagger.svg";
import NgrokIcon from "./software/ngrok.svg";

import KeycloakIcon from "./auth/keycloak.svg";
import JwtIcon from "./auth/jwt.svg";

import JestIcon from "./framework/jest.svg";
import AngularIcon from "./framework/angular.svg";
import NextIcon from "./framework/next.svg";
import FastApiIcon from "./framework/fast-api.svg";
import MaterialUiIcon from "./framework/material-ui.svg";
import ExpressIcon from "./framework/express.svg";
import FlaskIcon from "./framework/flask.svg";
import ViteIcon from "./framework/vite.svg";
import TailwindIcon from "./framework/tailwind.svg";
import VueIcon from "./framework/vue.svg";

import ShadcnIcon from "./library/shadcn.svg";
import ThreeIcon from "./library/three.svg";
import ReactRouterIcon from "./library/react_router.svg";
import PrettierIcon from "./library/prettier.svg";
import ReactIcon from "./library/react.svg";
import NodeIcon from "./library/node.svg";

import PostgresIcon from "./database/postgres.svg";
import MySqlIcon from "./database/my_sql.svg";
import SqliteIcon from "./database/sql_lite.svg";
import MongoDbIcon from "./database/mongodb.svg";

import YarnIcon from "./package/yarn.svg";
import BunIcon from "./package/bun.svg";
import NpmIcon from "./package/npm.svg";
import PnpmIcon from "./package/pnpm.svg";

import BlenderIcon from "./design/blender.svg";
import LayersIcon from "./design/layers.svg";
import HomeAssistantIcon from "./design/home_assistant.svg";

import EspIcon from "./hardware/esp.svg";
import ArduinoIcon from "./hardware/arduino.svg";
import RpiIcon from "./hardware/rpi.svg";

// Group icons under categories
export const Icons = {
  language: {
    BashIcon,
    RustIcon,
    JsonIcon,
    JavaScriptIcon,
    TypeScriptIcon,
    CssIcon,
    HtmlIcon,
    CppIcon,
    PythonIcon,
    CIcon,
    JavaIcon,
  },
  info: {
    DockerIcon,
    DiscordIcon,
    LinkedInIcon,
    SoundCloudIcon,
    SpotifyIcon,
    GitHubIcon,
    GmailIcon,
  },
  deployment: {
    OpenShiftIcon,
    AzureIcon,
    AWSIcon,
    VercelIcon,
    KubernetesIcon,
  },
  software: {
    PostmanIcon,
    GitIcon,
    StackOverflowIcon,
    VSCodeIcon,
    SwaggerIcon,
    NgrokIcon,
  },
  auth: {
    KeycloakIcon,
    JwtIcon,
  },
  framework: {
    JestIcon,
    AngularIcon,
    NextIcon,
    FastApiIcon,
    MaterialUiIcon,
    ExpressIcon,
    FlaskIcon,
    ViteIcon,
    TailwindIcon,
    VueIcon,
  },
  library: {
    ShadcnIcon,
    ThreeIcon,
    ReactRouterIcon,
    PrettierIcon,
    ReactIcon,
    NodeIcon,
  },
  database: {
    PostgresIcon,
    MySqlIcon,
    SqliteIcon,
    MongoDbIcon,
  },
  package: {
    YarnIcon,
    BunIcon,
    NpmIcon,
    PnpmIcon,
  },
  design: {
    BlenderIcon,
    LayersIcon,
    HomeAssistantIcon,
  },
  hardware: {
    EspIcon,
    ArduinoIcon,
    RpiIcon,
  },
};

// Export type for categories
export type IconCategory = keyof typeof Icons;
