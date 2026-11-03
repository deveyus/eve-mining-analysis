{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "eve-mining-analysis";
  buildInputs = [
    pkgs.python3
    pkgs.python3Packages.pip
    pkgs.python3Packages.matplotlib
    pkgs.python3Packages.numpy
  ];

        shellHook = ''
          export EVE_MINING_PROJECT=~/dev/eve-mining-analysis
          export PYTHONPATH="$PWD/src${PYTHONPATH:+:$PYTHONPATH}"
        '';
}
