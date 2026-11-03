{
  description = "EVE Online mining fleet analysis shell",

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable",

  outputs = { self, nixpkgs, ... }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; overlays = []; };
      devShell = pkgs.mkShell {
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
      };
    in {
      devShells.${system} = default = devShell;
    };
}
